package com.cuahangdienthoai.supplier.service;

import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.repository.NhanVienRepository;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.supplier.dto.ChiTietPhieuNhapDTO;
import com.cuahangdienthoai.supplier.dto.PhieuNhapDTO;
import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhap;
import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhapId;
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
import java.util.Collections;
import java.util.List;
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

    public List<PhieuNhapDTO> getAll() {
        return phieuNhapRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PhieuNhapDTO getById(String soPNhap) {
        return phieuNhapRepository.findById(soPNhap)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập: " + soPNhap));
    }

    public List<PhieuNhapDTO> getByNCC(String maNCC) {
        return phieuNhapRepository.findByNhaCungCapMaNCC(maNCC).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PhieuNhapDTO> getByNhanVien(String maNV) {
        return phieuNhapRepository.findByNhanVienMaNV(maNV).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PhieuNhapDTO create(PhieuNhapDTO dto) {
        NhaCungCap ncc = nhaCungCapRepository.findById(dto.getMaNCC())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp: " + dto.getMaNCC()));
        NhanVien nv = null;
        if (dto.getMaNV() != null && !dto.getMaNV().trim().isEmpty()) {
            nv = nhanVienRepository.findById(dto.getMaNV()).orElse(null);
        }
        if (nv == null) {
            nv = nhanVienRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên nhập kho"));
        }

        String soPN = dto.getSoPNhap();
        if (soPN == null || soPN.trim().isEmpty()) {
            soPN = "PN" + String.format("%03d", phieuNhapRepository.count() + 1);
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
            for (var ct : dto.getChiTiet()) {
                MatHang mh = matHangRepository.findById(ct.getMaHang())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + ct.getMaHang()));
                ChiTietPhieuNhapId id = new ChiTietPhieuNhapId(savedPn.getSoPNhap(), mh.getMaHang());
                ChiTietPhieuNhap detail = ChiTietPhieuNhap.builder()
                        .id(id)
                        .phieuNhap(savedPn)
                        .matHang(mh)
                        .slNhap(ct.getSlNhap())
                        .donGiaNhap(ct.getDonGiaNhap())
                        .build();
                detail = chiTietPhieuNhapRepository.save(detail);

                // Nếu mặt hàng quản lý IMEI thì sinh danh sách mã IMEI (15 chữ số)
                if (mh.isQuanLyImei()) {
                    int sl = ct.getSlNhap() > 0 ? ct.getSlNhap() : 1;
                    for (int k = 0; k < sl; k++) {
                        long countImei = imeiRepository.count() + 1 + k;
                        String maImei = "IMEI" + String.format("%03d", countImei);
                        // Sinh 15 chữ số duy nhất bắt đầu bằng 35
                        long randomPart = (long) (Math.random() * 9000000000000L) + 1000000000000L;
                        String soImei = "35" + String.valueOf(randomPart).substring(0, 13);

                        com.cuahangdienthoai.supplier.entity.Imei imeiObj = com.cuahangdienthoai.supplier.entity.Imei.builder()
                                .maIMEI(maImei)
                                .chiTietPhieuNhap(detail)
                                .soIMEI(soImei)
                                .trangThai("con_hang")
                                .build();
                        imeiRepository.save(imeiObj);
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
