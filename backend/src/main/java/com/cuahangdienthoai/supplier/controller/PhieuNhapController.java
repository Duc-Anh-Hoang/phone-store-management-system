package com.cuahangdienthoai.supplier.controller;

import com.cuahangdienthoai.supplier.dto.PhieuNhapDTO;
import com.cuahangdienthoai.supplier.service.PhieuNhapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phieunhap")
@RequiredArgsConstructor
public class PhieuNhapController {

    private final PhieuNhapService phieuNhapService;

    @GetMapping
    public List<PhieuNhapDTO> getAll() {
        return phieuNhapService.getAll();
    }

    @GetMapping("/{soPNhap}")
    public PhieuNhapDTO getById(@PathVariable String soPNhap) {
        return phieuNhapService.getById(soPNhap);
    }

    @GetMapping("/ncc/{maNCC}")
    public List<PhieuNhapDTO> getByNCC(@PathVariable String maNCC) {
        return phieuNhapService.getByNCC(maNCC);
    }

    @GetMapping("/nhanvien/{maNV}")
    public List<PhieuNhapDTO> getByNhanVien(@PathVariable String maNV) {
        return phieuNhapService.getByNhanVien(maNV);
    }

    @PostMapping
    public PhieuNhapDTO create(@Valid @RequestBody PhieuNhapDTO dto) {
        return phieuNhapService.create(dto);
    }

    @DeleteMapping("/{soPNhap}")
    public ResponseEntity<Void> delete(@PathVariable String soPNhap) {
        phieuNhapService.delete(soPNhap);
        return ResponseEntity.noContent().build();
    }
}
