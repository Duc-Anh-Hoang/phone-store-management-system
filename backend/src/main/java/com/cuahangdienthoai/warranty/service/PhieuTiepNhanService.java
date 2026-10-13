package com.cuahangdienthoai.warranty.service;

import com.cuahangdienthoai.warranty.dto.PhieuTiepNhanDTO;
import com.cuahangdienthoai.warranty.entity.PhieuTiepNhanBaoHanh;
import com.cuahangdienthoai.warranty.repository.PhieuTiepNhanBaoHanhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        var bh = baoHanhRepository.findById(dto.getMaBH())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảo hành: " + dto.getMaBH()));
        var nvTiepNhan = nhanVienRepository.findById(dto.getMaNVTiepNhan())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy NV tiếp nhận: " + dto.getMaNVTiepNhan()));
        var nvKyThuat = (dto.getMaNVKyThuat() != null && !dto.getMaNVKyThuat().trim().isEmpty())
                ? nhanVienRepository.findById(dto.getMaNVKyThuat()).orElse(null) : null;

        PhieuTiepNhanBaoHanh entity = PhieuTiepNhanBaoHanh.builder()
                .maTN(dto.getMaTN())
                .baoHanh(bh)
                .ngayNhan(java.time.LocalDateTime.now())
                .tinhTrangLoi(dto.getTinhTrangLoi())
                .nhanVienTiepNhan(nvTiepNhan)
                .nhanVienKyThuat(nvKyThuat)
                .chiPhi(dto.getChiPhi() != null ? dto.getChiPhi() : java.math.BigDecimal.ZERO)
                .trangThai("tiep_nhan")
                .build();
        return toDTO(phieuTiepNhanRepository.save(entity));
    }

    @Transactional
    public PhieuTiepNhanDTO updateTrangThai(String maTN, String trangThai) {
        PhieuTiepNhanBaoHanh entity = phieuTiepNhanRepository.findById(maTN)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu tiếp nhận: " + maTN));
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
