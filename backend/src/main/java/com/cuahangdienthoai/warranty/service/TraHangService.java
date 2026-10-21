package com.cuahangdienthoai.warranty.service;

import com.cuahangdienthoai.common.repository.ThamSoRepository;
import com.cuahangdienthoai.common.security.CurrentUser;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.order.entity.ChiTietHoaDon;
import com.cuahangdienthoai.order.entity.HoaDon;
import com.cuahangdienthoai.order.repository.ChiTietHoaDonRepository;
import com.cuahangdienthoai.order.repository.HoaDonRepository;
import com.cuahangdienthoai.supplier.entity.Imei;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import com.cuahangdienthoai.warranty.dto.TraHangDTO;
import com.cuahangdienthoai.warranty.entity.TraHang;
import com.cuahangdienthoai.warranty.repository.TraHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TraHangService {

    private final TraHangRepository traHangRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final ImeiRepository imeiRepository;
    private final ThamSoRepository thamSoRepository;
    private final CurrentUser currentUser;
    private final com.cuahangdienthoai.common.CodeGenerator codeGenerator;

    private static final Set<String> HOP_LE_HOAN_TIEN = Set.of("tien_mat", "chuyen_khoan", "doi_hang");

    public List<TraHangDTO> getAll() {
        return traHangRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TraHangDTO getById(String maTR) {
        return traHangRepository.findById(maTR)
                .map(this::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu trả hàng: " + maTR));
    }

    public List<TraHangDTO> getByHoaDon(String soHD) {
        return traHangRepository.findByHoaDonSoHD(soHD).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public TraHangDTO create(TraHangDTO dto) {
        if (dto == null || dto.getSoHD() == null || dto.getSoHD().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng cung cấp số hóa đơn cần đổi trả");
        }

        HoaDon hd = hoaDonRepository.findById(dto.getSoHD().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn: " + dto.getSoHD()));

        // 1. Kiểm tra thời hạn đổi trả từ ThamSo (HAN_DOITRA_NGAY, mặc định 30 ngày)
        int hanDoiTra = 30;
        try {
            var tsOpt = thamSoRepository.findById("HAN_DOITRA_NGAY");
            if (tsOpt.isPresent() && tsOpt.get().getGiaTri() != null) {
                hanDoiTra = tsOpt.get().getGiaTri().intValue();
            }
        } catch (Exception ignored) {}

        if (hd.getNgayLap() != null && hd.getNgayLap().plusDays(hanDoiTra).isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Đã quá thời hạn đổi trả (" + hanDoiTra + " ngày) kể từ ngày lập hóa đơn " + hd.getSoHD());
        }

        // 2. Kiểm tra hình thức hoàn tiền hợp lệ
        String hinhThuc = dto.getHinhThucHoanTien() != null ? dto.getHinhThucHoanTien().toLowerCase().trim() : "tien_mat";
        if (!HOP_LE_HOAN_TIEN.contains(hinhThuc)) {
            throw new IllegalArgumentException("Hình thức hoàn tiền không hợp lệ ('" + hinhThuc + "'). Chỉ chấp nhận: tien_mat, chuyen_khoan, doi_hang");
        }

        // 3. S5: Bỏ nhánh lấy IMEI đầu tiên. Khách/Nhân viên bắt buộc phải chọn IMEI
        String inputImei = null;
        if (dto.getSoIMEI() != null && !dto.getSoIMEI().trim().isEmpty()) {
            inputImei = dto.getSoIMEI().trim();
        } else if (dto.getMaIMEI() != null && !dto.getMaIMEI().trim().isEmpty()) {
            inputImei = dto.getMaIMEI().trim();
        }

        if (inputImei == null) {
            throw new IllegalArgumentException("Vui lòng chọn IMEI cần đổi trả");
        }

        Imei imei = imeiRepository.findBySoIMEI(inputImei).orElse(null);
        if (imei == null) {
            imei = imeiRepository.findById(inputImei).orElse(null);
        }
        if (imei == null) {
            throw new IllegalArgumentException("Không tìm thấy thông tin IMEI: " + inputImei);
        }

        // 4. S5: IMEI phải nằm trong ChiTietHoaDon của hóa đơn đó
        List<ChiTietHoaDon> chiTiets = chiTietHoaDonRepository.findByHoaDonSoHD(hd.getSoHD());
        final String finalMaImei = imei.getMaIMEI();
        boolean inInvoice = chiTiets != null && chiTiets.stream()
                .anyMatch(ct -> ct.getImei() != null && finalMaImei.equalsIgnoreCase(ct.getImei().getMaIMEI()));

        if (!inInvoice) {
            throw new IllegalArgumentException("IMEI " + inputImei + " không thuộc hóa đơn " + hd.getSoHD());
        }

        // 5. S5: Trạng thái hiện tại của IMEI phải là 'da_ban'
        if (!"da_ban".equalsIgnoreCase(imei.getTrangThai())) {
            throw new IllegalArgumentException("IMEI không ở trạng thái đã bán (trạng thái hiện tại: " + imei.getTrangThai() + ")");
        }

        // 6. S5: Chưa có phiếu TraHang cho IMEI này
        if (traHangRepository.findByImeiMaIMEI(imei.getMaIMEI()).isPresent()) {
            throw new IllegalArgumentException("IMEI này đã được lập phiếu đổi trả trước đó");
        }

        // 7. M1: Lấy nhân viên từ token xác thực
        NhanVien nv = currentUser.getCurrentNhanVien();

        // 8. Cập nhật trạng thái IMEI sang 'tra_hang'
        imei.setTrangThai("tra_hang");
        imeiRepository.save(imei);

        String maTR = dto.getMaTR();
        if (maTR == null || maTR.trim().isEmpty()) {
            maTR = codeGenerator.generateNextMaTR();
        }

        TraHang traHang = TraHang.builder()
                .maTR(maTR)
                .hoaDon(hd)
                .imei(imei)
                .ngayTR(LocalDateTime.now())
                .lyDo(dto.getLyDo() != null ? dto.getLyDo() : "Đổi trả theo yêu cầu khách hàng")
                .hinhThucHoanTien(hinhThuc)
                .nhanVien(nv)
                .build();

        return toDTO(traHangRepository.save(traHang));
    }

    @Transactional
    public void delete(String maTR) {
        traHangRepository.deleteById(maTR);
    }

    private TraHangDTO toDTO(TraHang e) {
        return TraHangDTO.builder()
                .maTR(e.getMaTR())
                .soHD(e.getHoaDon() != null ? e.getHoaDon().getSoHD() : null)
                .maIMEI(e.getImei() != null ? e.getImei().getMaIMEI() : null)
                .soIMEI(e.getImei() != null ? e.getImei().getSoIMEI() : null)
                .maHang(e.getImei() != null && e.getImei().getMatHang() != null ? e.getImei().getMatHang().getMaHang() : null)
                .tenHang(e.getImei() != null && e.getImei().getMatHang() != null ? e.getImei().getMatHang().getTenHang() : null)
                .ngayTR(e.getNgayTR() != null ? e.getNgayTR().toString() : null)
                .lyDo(e.getLyDo())
                .hinhThucHoanTien(e.getHinhThucHoanTien())
                .maNV(e.getNhanVien() != null ? e.getNhanVien().getMaNV() : null)
                .tenNhanVien(e.getNhanVien() != null ? e.getNhanVien().getHoTen() : null)
                .build();
    }
}
