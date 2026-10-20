package com.cuahangdienthoai.warranty.service;

import com.cuahangdienthoai.common.repository.ThamSoRepository;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.repository.NhanVienRepository;
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

import java.math.BigDecimal;
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
    private final NhanVienRepository nhanVienRepository;
    private final ThamSoRepository thamSoRepository;

    private static final Set<String> HOP_LE_HOAN_TIEN = Set.of("tien_mat", "chuyen_khoan", "doi_hang");

    public List<TraHangDTO> getAll() {
        return traHangRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TraHangDTO getById(String maTR) {
        return traHangRepository.findById(maTR)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu trả hàng: " + maTR));
    }

    public List<TraHangDTO> getByHoaDon(String soHD) {
        return traHangRepository.findByHoaDonSoHD(soHD).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public TraHangDTO create(TraHangDTO dto) {
        HoaDon hd = hoaDonRepository.findById(dto.getSoHD())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn: " + dto.getSoHD()));

        // B5: Kiểm tra thời hạn đổi trả từ ThamSo (HAN_DOITRA_NGAY = 30)
        int hanDoiTra = 30;
        try {
            var tsOpt = thamSoRepository.findById("HAN_DOITRA_NGAY");
            if (tsOpt.isPresent() && tsOpt.get().getGiaTri() != null) {
                hanDoiTra = tsOpt.get().getGiaTri().intValue();
            }
        } catch (Exception ignored) {}

        if (hd.getNgayLap() != null && hd.getNgayLap().plusDays(hanDoiTra).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Đã quá thời hạn đổi trả (" + hanDoiTra + " ngày) kể từ ngày lập hóa đơn " + hd.getSoHD() + " (" + hd.getNgayLap() + ")");
        }

        // B5: Kiểm tra hình thức hoàn tiền hợp lệ
        String hinhThuc = dto.getHinhThucHoanTien() != null ? dto.getHinhThucHoanTien().toLowerCase().trim() : "tien_mat";
        if (!HOP_LE_HOAN_TIEN.contains(hinhThuc)) {
            throw new RuntimeException("Hình thức hoàn tiền không hợp lệ ('" + hinhThuc + "'). Chỉ chấp nhận: tien_mat, chuyen_khoan, doi_hang");
        }

        Imei imei = null;
        if (dto.getMaIMEI() != null && !dto.getMaIMEI().trim().isEmpty()) {
            imei = imeiRepository.findById(dto.getMaIMEI()).orElse(null);
            if (imei == null) {
                imei = imeiRepository.findBySoIMEI(dto.getMaIMEI()).orElse(null);
            }
        }
        if (imei == null && dto.getSoIMEI() != null && !dto.getSoIMEI().trim().isEmpty()) {
            imei = imeiRepository.findBySoIMEI(dto.getSoIMEI()).orElse(null);
            if (imei == null) {
                imei = imeiRepository.findById(dto.getSoIMEI()).orElse(null);
            }
        }
        if (imei == null) {
            var chiTiets = chiTietHoaDonRepository.findByHoaDonSoHD(hd.getSoHD());
            if (chiTiets != null) {
                for (var cthd : chiTiets) {
                    if (cthd.getImei() != null) {
                        imei = cthd.getImei();
                        break;
                    }
                }
            }
        }
        if (imei == null) {
            throw new RuntimeException("Không tìm thấy IMEI hợp lệ để làm thủ tục đổi trả");
        }

        NhanVien nv = null;
        if (dto.getMaNV() != null && !dto.getMaNV().trim().isEmpty()) {
            nv = nhanVienRepository.findById(dto.getMaNV()).orElse(null);
        }
        if (nv == null) {
            nv = hd.getNhanVien();
        }
        if (nv == null) {
            nv = nhanVienRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên thực hiện đổi trả"));
        }

        // B5: Cập nhật trạng thái IMEI sang 'tra_hang'
        imei.setTrangThai("tra_hang");
        imeiRepository.save(imei);

        String maTR = dto.getMaTR();
        if (maTR == null || maTR.trim().isEmpty()) {
            maTR = "TR" + String.format("%05d", (int) (System.currentTimeMillis() % 100000));
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
