package com.cuahangdienthoai.employee.controller;

import com.cuahangdienthoai.employee.dto.NhanVienDTO;
import com.cuahangdienthoai.employee.service.NhanVienService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nhanvien")
@RequiredArgsConstructor
public class NhanVienController {

    private final NhanVienService nhanVienService;

    @GetMapping
    public List<NhanVienDTO> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("currentRole");
        List<NhanVienDTO> list = nhanVienService.getAll();
        if (role == null || (!"ADMIN".equalsIgnoreCase(role) && !"QUANLY".equalsIgnoreCase(role))) {
            return list.stream().map(this::sanitizeForStaff).collect(Collectors.toList());
        }
        return list;
    }

    @GetMapping("/{maNV}")
    public NhanVienDTO getById(@PathVariable String maNV, HttpServletRequest request) {
        String role = (String) request.getAttribute("currentRole");
        NhanVienDTO dto = nhanVienService.getById(maNV);
        if (role == null || (!"ADMIN".equalsIgnoreCase(role) && !"QUANLY".equalsIgnoreCase(role))) {
            return sanitizeForStaff(dto);
        }
        return dto;
    }

    @GetMapping("/trangthai/{trangThai}")
    public List<NhanVienDTO> getByTrangThai(@PathVariable String trangThai, HttpServletRequest request) {
        String role = (String) request.getAttribute("currentRole");
        List<NhanVienDTO> list = nhanVienService.getByTrangThai(trangThai);
        if (role == null || (!"ADMIN".equalsIgnoreCase(role) && !"QUANLY".equalsIgnoreCase(role))) {
            return list.stream().map(this::sanitizeForStaff).collect(Collectors.toList());
        }
        return list;
    }

    @PostMapping
    public NhanVienDTO create(@RequestBody NhanVienDTO dto) {
        return nhanVienService.create(dto);
    }

    @PutMapping("/{maNV}")
    public NhanVienDTO update(@PathVariable String maNV, @RequestBody NhanVienDTO dto) {
        return nhanVienService.update(maNV, dto);
    }

    @DeleteMapping("/{maNV}")
    public ResponseEntity<Void> delete(@PathVariable String maNV) {
        nhanVienService.delete(maNV);
        return ResponseEntity.noContent().build();
    }

    private NhanVienDTO sanitizeForStaff(NhanVienDTO dto) {
        if (dto == null) return null;
        return NhanVienDTO.builder()
                .maNV(dto.getMaNV())
                .hoTen(dto.getHoTen())
                .chucVu(dto.getChucVu())
                .trangThai(dto.getTrangThai())
                .sdt(null)
                .email(null)
                .ngayVaoLam(null)
                .build();
    }
}
