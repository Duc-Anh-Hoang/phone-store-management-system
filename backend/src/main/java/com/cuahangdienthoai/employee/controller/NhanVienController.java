package com.cuahangdienthoai.employee.controller;

import com.cuahangdienthoai.employee.dto.NhanVienDTO;
import com.cuahangdienthoai.employee.service.NhanVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhanvien")
@RequiredArgsConstructor
public class NhanVienController {

    private final NhanVienService nhanVienService;

    @GetMapping
    public List<NhanVienDTO> getAll() {
        return nhanVienService.getAll();
    }

    @GetMapping("/{maNV}")
    public NhanVienDTO getById(@PathVariable String maNV) {
        return nhanVienService.getById(maNV);
    }

    @GetMapping("/trangthai/{trangThai}")
    public List<NhanVienDTO> getByTrangThai(@PathVariable String trangThai) {
        return nhanVienService.getByTrangThai(trangThai);
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
}
