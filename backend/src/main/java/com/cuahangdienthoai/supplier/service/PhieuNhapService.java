package com.cuahangdienthoai.supplier.service;

import com.cuahangdienthoai.common.CodeGenerator;
import com.cuahangdienthoai.common.security.CurrentUser;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.repository.NhanVienRepository;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.supplier.dto.ChiTietPhieuNhapDTO;
import com.cuahangdienthoai.supplier.dto.PhieuNhapDTO;
import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhap;
import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhapId;
import com.cuahangdienthoai.supplier.entity.Imei;
import com.cuahangdienthoai.supplier.entity.NhaCungCap;
import com.cuahangdienthoai.supplier.entity.PhieuNhap;
import com.cuahangdienthoai.supplier.repository.ChiTietPhieuNhapRepository;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import com.cuahangdienthoai.supplier.repository.NhaCungCapRepository;
import com.cuahangdienthoai.supplier.repository.PhieuNhapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhieuNhapService {

    private final PhieuNhapRepository phieuNhapRepository;
    private final ChiTietPhieuNhapRepository chiTietPhieuNhapRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final NhanVienRepository nhanVienRepository;
    private final MatHangRepository matHangRepository;
    private final ImeiRepository imeiRepository;
    private final CurrentUser currentUser;
    private final CodeGenerator codeGenerator;

    public List<PhieuNhapDTO> getAll() {
        return phieuNhapRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PhieuNhapDTO getById(String soPNhap) {
        return phieuNhapRepository.findById(soPNhap)
                .map(this::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu nhập: " + soPNhap));
    }

    public List<PhieuNhapDTO> getByNCC(String maNCC) {
        return getByNhaCungCap(maNCC);
    }

    public List<PhieuNhapDTO> getByNhaCungCap(String maNCC) {
        return phieuNhapRepository.findByNhaCungCapMaNCC(maNCC).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PhieuNhapDTO> getByNhanVien(String maNV) {
        return phieuNhapRepository.findByNhanVienMaNV(maNV).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public PhieuNhapDTO create(PhieuNhapDTO dto) {
        if (dto == null || dto.getMaNCC() == null || dto.getMaNCC().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn nhà cung cấp");
        }

        NhaCungCap ncc = nhaCungCapRepository.findById(dto.getMaNCC().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhà cung cấp: " + dto.getMaNCC()));

        NhanVien nv = currentUser.getCurrentNhanVien();

        String soPN = dto.getSoPNhap();
        if (soPN == null || soPN.trim().isEmpty()) {
            soPN = codeGenerator.generateNextSoPN();
        }

        PhieuNhap phieuNhap = PhieuNhap.builder()
                .soPNhap(soPN)
                .ngayNhap(LocalDateTime.now())
                .nhaCungCap(ncc)
                .nhanVien(nv)
                .build();
        phieuNhap = phieuNhapRepository.save(phieuNhap);

        if (dto.getChiTiet() != null && !dto.getChiTiet().isEmpty()) {
            final PhieuNhap savedPn = phieuNhap;
            Set<String> allInputImeis = new HashSet<>();

            for (ChiTietPhieuNhapDTO ct : dto.getChiTiet()) {
                MatHang mh = matHangRepository.findById(ct.getMaHang())
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mặt hàng: " + ct.getMaHang()));

                int slNhap = ct.getSlNhap();
                if (slNhap <= 0) {
                    throw new IllegalArgumentException("Số lượng nhập phải lớn hơn 0");
                }

                ChiTietPhieuNhapId id = new ChiTietPhieuNhapId(savedPn.getSoPNhap(), mh.getMaHang());
                ChiTietPhieuNhap detail = ChiTietPhieuNhap.builder()
                        .id(id)
                        .phieuNhap(savedPn)
                        .matHang(mh)
                        .slNhap(slNhap)
                        .donGiaNhap(ct.getDonGiaNhap())
                        .build();
                detail = chiTietPhieuNhapRepository.save(detail);

                // Xử lý kiểm tra IMEI (S6)
                if (mh.isQuanLyImei()) {
                    List<String> imeiList = ct.getDanhSachImei();
                    int countProvided = (imeiList != null) ? imeiList.size() : 0;
                    if (countProvided != slNhap) {
                        throw new IllegalArgumentException("Mặt hàng " + mh.getTenHang() + " (" + mh.getMaHang() +
                                ") quản lý IMEI: số lượng IMEI (" + countProvided + ") phải bằng số lượng nhập (" + slNhap + ")");
                    }

                    for (String rawImei : imeiList) {
                        if (rawImei == null || !rawImei.trim().matches("^[0-9]{15}$")) {
                            throw new IllegalArgumentException("IMEI không hợp lệ (phải đúng 15 chữ số): " + rawImei);
                        }
                        String cleanImei = rawImei.trim();

                        if (!allInputImeis.add(cleanImei)) {
                            throw new IllegalArgumentException("Danh sách IMEI bị trùng lặp: " + cleanImei);
                        }

                        if (imeiRepository.findBySoIMEI(cleanImei).isPresent()) {
                            throw new IllegalArgumentException("Số IMEI đã tồn tại trong hệ thống: " + cleanImei);
                        }

                        String maImei = codeGenerator.generateNextMaIMEI();
                        Imei imeiObj = Imei.builder()
                                .maIMEI(maImei)
                                .chiTietPhieuNhap(detail)
                                .soIMEI(cleanImei)
                                .trangThai("con_hang")
                                .build();
                        imeiRepository.save(imeiObj);
                    }
                } else {
                    // Mặt hàng không quản lý IMEI thì không nhận danh sách IMEI
                    if (ct.getDanhSachImei() != null && !ct.getDanhSachImei().isEmpty()) {
                        throw new IllegalArgumentException("Mặt hàng " + mh.getTenHang() + " không quản lý IMEI, không được gửi danh sách IMEI");
                    }
                }
            }
        }

        return toDTO(phieuNhap);
    }

    @Transactional
    public void delete(String soPNhap) {
        List<ChiTietPhieuNhap> ctpn = chiTietPhieuNhapRepository.findByIdSoPNhap(soPNhap);
        chiTietPhieuNhapRepository.deleteAll(ctpn);
        phieuNhapRepository.deleteById(soPNhap);
    }

    private PhieuNhapDTO toDTO(PhieuNhap e) {
        List<ChiTietPhieuNhapDTO> chiTietList = chiTietPhieuNhapRepository.findByIdSoPNhap(e.getSoPNhap()).stream()
                .map(ct -> ChiTietPhieuNhapDTO.builder()
                        .soPNhap(ct.getId().getSoPNhap())
                        .maHang(ct.getMatHang().getMaHang())
                        .tenHang(ct.getMatHang().getTenHang())
                        .slNhap(ct.getSlNhap())
                        .donGiaNhap(ct.getDonGiaNhap())
                        .build())
                .collect(Collectors.toList());

        return PhieuNhapDTO.builder()
                .soPNhap(e.getSoPNhap())
                .ngayNhap(e.getNgayNhap() != null ? e.getNgayNhap().toString() : null)
                .maNCC(e.getNhaCungCap() != null ? e.getNhaCungCap().getMaNCC() : null)
                .tenNCC(e.getNhaCungCap() != null ? e.getNhaCungCap().getTenNCC() : null)
                .maNV(e.getNhanVien() != null ? e.getNhanVien().getMaNV() : null)
                .tenNhanVien(e.getNhanVien() != null ? e.getNhanVien().getHoTen() : null)
                .chiTiet(chiTietList)
                .build();
    }
}
