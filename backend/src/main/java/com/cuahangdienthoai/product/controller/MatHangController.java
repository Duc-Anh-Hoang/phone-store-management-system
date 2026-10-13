package com.cuahangdienthoai.product.controller;

import com.cuahangdienthoai.product.dto.MatHangDTO;
import com.cuahangdienthoai.product.service.MatHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mathang")
@RequiredArgsConstructor
public class MatHangController {

    private final MatHangService matHangService;

    @GetMapping
    public List<MatHangDTO> getAll() { return matHangService.getAll(); }

    @GetMapping("/{maHang}")
    public MatHangDTO getById(@PathVariable String maHang) { return matHangService.getById(maHang); }

    @GetMapping("/nhom/{maNhom}")
    public List<MatHangDTO> getByNhom(@PathVariable String maNhom) { return matHangService.getByNhomHang(maNhom); }

    @PostMapping
    public MatHangDTO create(@RequestBody MatHangDTO dto) { return matHangService.create(dto); }

    @PutMapping("/{maHang}")
    public MatHangDTO update(@PathVariable String maHang, @RequestBody MatHangDTO dto) {
        return matHangService.update(maHang, dto);
    }

    @DeleteMapping("/{maHang}")
    public ResponseEntity<Void> delete(@PathVariable String maHang) {
        matHangService.delete(maHang);
        return ResponseEntity.noContent().build();
    }
}
