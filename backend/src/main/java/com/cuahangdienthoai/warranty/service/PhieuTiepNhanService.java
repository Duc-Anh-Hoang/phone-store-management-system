package com.cuahangdienthoai.warranty.service;

import com.cuahangdienthoai.warranty.dto.PhieuTiepNhanDTO;
import com.cuahangdienthoai.warranty.entity.BaoHanh;
import com.cuahangdienthoai.warranty.entity.PhieuTiepNhanBaoHanh;
import com.cuahangdienthoai.warranty.repository.PhieuTiepNhanBaoHanhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhieuTiepNhanService {

    private final PhieuTiepNhanBaoHanhRepository phieuTiepNhanRepository;
    private final com.cuahangdienthoai.warranty.repository.BaoHanhRepository baoHanhRepository;
    private final com.cuahangdienthoai.employee.repository.NhanVienRepository nhanVienRepository;

    public List<PhieuTiepNhanDTO> getAll() {
        return phieuTiepNhanRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PhieuTiepNhanDTO getById(String maTN) {
        return phieuTiepNhanRepository.findById(maTN)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu tiếp nhận: " + maTN));
    }

    public List<PhieuTiepNhanDTO> getByTrangThai(String trangThai) {
        return phieuTiepNhanRepository.findByTrangThai(trangThai).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public PhieuTiepNhanDTO create(PhieuTiepNhanDTO dto) {
        BaoHanh bh = null;
        if (dto.getMaBH() != null && !dto.getMaBH().trim().isEmpty()) {
            bh = baoHanhRepository.findById(dto.getMaBH()).orElse(null);
        }
        if (bh == null && dto.getSoIMEI() != null && !dto.getSoIMEI().trim().isEmpty()) {
            bh = baoHanhRepository.findByImeiSoIMEI(dto.getSoIMEI()).orElse(null);
            if (bh == null) {
                bh = baoHanhRepository.findByImeiMaIMEI(dto.getSoIMEI()).orElse(null);
            }
        }
        if (bh == null && dto.getMaIMEI() != null && !dto.getMaIMEI().trim().isEmpty()) {
            bh = baoHanhRepository.findByImeiMaIMEI(dto.getMaIMEI()).orElse(null);
            if (bh == null) {
                bh = baoHanhRepository.findByImeiSoIMEI(dto.getMaIMEI()).orElse(null);
            }
        }
        if (bh == null) {
            throw new RuntimeException("Không tìm thấy sổ bảo hành hợp lệ cho thiết bị.");
        }

        // B6: Tiếp nhận bảo hành chỉ khi còn hạn
        LocalDateTime ngayKT = bh.getNgayBD().plusMonths(bh.getThoiHanThang());
        if (ngayKT.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Sổ bảo hành " + bh.getMaBH() + " đã hết hạn từ ngày " + ngayKT.toLocalDate() + ". Không thể tiếp nhận bảo hành.");
        }

        var nvTiepNhan = (dto.getMaNVTiepNhan() != null && !dto.getMaNVTiepNhan().trim().isEmpty())
                ? nhanVienRepository.findById(dto.getMaNVTiepNhan()).orElse(null) : null;
        if (nvTiepNhan == null) {
            nvTiepNhan = nhanVienRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên tiếp nhận"));
        }

        var nvKyThuat = (dto.getMaNVKyThuat() != null && !dto.getMaNVKyThuat().trim().isEmpty())
                ? nhanVienRepository.findById(dto.getMaNVKyThuat()).orElse(null) : null;

        String maTN = dto.getMaTN();
        if (maTN == null || maTN.trim().isEmpty()) {
            maTN = "TN" + String.format("%05d", (int) (System.currentTimeMillis() % 100000));
        }

        LocalDateTime ngayHenTra = dto.getNgayHenTra() != null ? LocalDateTime.parse(dto.getNgayHenTra()) : LocalDateTime.now().plusDays(7);

        PhieuTiepNhanBaoHanh entity = PhieuTiepNhanBaoHanh.builder()
                .maTN(maTN)
                .baoHanh(bh)
                .ngayNhan(LocalDateTime.now())
                .tinhTrangLoi(dto.getTinhTrangLoi() != null ? dto.getTinhTrangLoi() : "Lỗi thiết bị cần kiểm tra")
                .nhanVienTiepNhan(nvTiepNhan)
                .nhanVienKyThuat(nvKyThuat)
                .ngayHenTra(ngayHenTra)
                .chiPhi(dto.getChiPhi() != null ? dto.getChiPhi() : java.math.BigDecimal.ZERO)
                .trangThai("tiep_nhan")
                .build();
        return toDTO(phieuTiepNhanRepository.save(entity));
    }

    @Transactional
    public PhieuTiepNhanDTO updateTrangThai(String maTN, String trangThai) {
        PhieuTiepNhanBaoHanh entity = phieuTiepNhanRepository.findById(maTN)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu tiếp nhận: " + maTN));

        String cu = entity.getTrangThai();
        boolean valid = false;
        // B6: Trạng thái chuyển: tiep_nhan → dang_sua/cho_linh_kien → hoan_thanh → da_tra
        if ("tiep_nhan".equals(cu) && ("dang_sua".equals(trangThai) || "cho_linh_kien".equals(trangThai))) {
            valid = true;
        } else if (("dang_sua".equals(cu) || "cho_linh_kien".equals(cu)) && "hoan_thanh".equals(trangThai)) {
            valid = true;
        } else if ("hoan_thanh".equals(cu) && "da_tra".equals(trangThai)) {
            valid = true;
        }

        if (!valid) {
            throw new RuntimeException("Chuyển trạng thái bảo hành không hợp lệ từ '" + cu + "' sang '" + trangThai + "'. Thứ tự: tiep_nhan -> dang_sua/cho_linh_kien -> hoan_thanh -> da_tra.");
        }

        if ("da_tra".equals(trangThai)) {
            entity.setNgayTra(LocalDateTime.now());
        }

        entity.setTrangThai(trangThai);
        return toDTO(phieuTiepNhanRepository.save(entity));
    }

    private PhieuTiepNhanDTO toDTO(PhieuTiepNhanBaoHanh e) {
        return PhieuTiepNhanDTO.builder()
                .maTN(e.getMaTN())
                .maBH(e.getBaoHanh().getMaBH())
                .maIMEI(e.getBaoHanh().getImei().getMaIMEI())
                .soIMEI(e.getBaoHanh().getImei().getSoIMEI())
                .ngayNhan(e.getNgayNhan() != null ? e.getNgayNhan().toString() : null)
                .tinhTrangLoi(e.getTinhTrangLoi())
                .maNVTiepNhan(e.getNhanVienTiepNhan().getMaNV())
                .tenNVTiepNhan(e.getNhanVienTiepNhan().getHoTen())
                .maNVKyThuat(e.getNhanVienKyThuat() != null ? e.getNhanVienKyThuat().getMaNV() : null)
                .tenNVKyThuat(e.getNhanVienKyThuat() != null ? e.getNhanVienKyThuat().getHoTen() : null)
                .ngayHenTra(e.getNgayHenTra() != null ? e.getNgayHenTra().toString() : null)
                .ngayTra(e.getNgayTra() != null ? e.getNgayTra().toString() : null)
                .ketQua(e.getKetQua())
                .chiPhi(e.getChiPhi())
                .trangThai(e.getTrangThai())
                .build();
    }
}
