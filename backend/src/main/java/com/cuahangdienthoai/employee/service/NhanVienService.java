package com.cuahangdienthoai.employee.service;

import com.cuahangdienthoai.employee.dto.NhanVienDTO;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NhanVienService {

    private final NhanVienRepository nhanVienRepository;

    public List<NhanVienDTO> getAll() {
        return nhanVienRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public NhanVienDTO getById(String maNV) {
        return nhanVienRepository.findById(maNV)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + maNV));
    }

    @Transactional
    public NhanVienDTO create(NhanVienDTO dto) {
        if (nhanVienRepository.existsById(dto.getMaNV())) {
            throw new RuntimeException("Mã nhân viên đã tồn tại: " + dto.getMaNV());
        }
        NhanVien entity = toEntity(dto);
        entity.setNgayVaoLam(LocalDateTime.now());
        entity.setTrangThai("dang_lam");
        return toDTO(nhanVienRepository.save(entity));
    }

    @Transactional
    public NhanVienDTO update(String maNV, NhanVienDTO dto) {
        NhanVien entity = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + maNV));
        entity.setHoTen(dto.getHoTen());
        entity.setChucVu(dto.getChucVu());
        entity.setSdt(dto.getSdt());
        entity.setEmail(dto.getEmail());
        if (dto.getTrangThai() != null) entity.setTrangThai(dto.getTrangThai());
        return toDTO(nhanVienRepository.save(entity));
    }

    @Transactional
    public void delete(String maNV) {
        nhanVienRepository.deleteById(maNV);
    }

    public List<NhanVienDTO> getByTrangThai(String trangThai) {
        return nhanVienRepository.findByTrangThai(trangThai).stream().map(this::toDTO).collect(Collectors.toList());
    }

    private NhanVienDTO toDTO(NhanVien e) {
        return NhanVienDTO.builder()
                .maNV(e.getMaNV())
                .hoTen(e.getHoTen())
                .chucVu(e.getChucVu())
                .sdt(e.getSdt())
                .email(e.getEmail())
                .ngayVaoLam(e.getNgayVaoLam() != null ? e.getNgayVaoLam().toString() : null)
                .trangThai(e.getTrangThai())
                .build();
    }

    private NhanVien toEntity(NhanVienDTO dto) {
        return NhanVien.builder()
                .maNV(dto.getMaNV())
                .hoTen(dto.getHoTen())
                .chucVu(dto.getChucVu())
                .sdt(dto.getSdt())
                .email(dto.getEmail())
                .trangThai(dto.getTrangThai() != null ? dto.getTrangThai() : "dang_lam")
                .build();
    }
}
