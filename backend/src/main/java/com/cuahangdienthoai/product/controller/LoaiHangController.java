package com.cuahangdienthoai.product.controller;

import com.cuahangdienthoai.product.dto.LoaiHangDTO;
import com.cuahangdienthoai.product.service.LoaiHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loaihang")
@RequiredArgsConstructor
public class LoaiHangController {
    private final LoaiHangService loaiHangService;

    @GetMapping
    public List<LoaiHangDTO> getAll() { return loaiHangService.getAll(); }

    @GetMapping("/{maLoai}")
    public LoaiHangDTO getById(@PathVariable String maLoai) { return loaiHangService.getById(maLoai); }

    @PostMapping
    public LoaiHangDTO create(@RequestBody LoaiHangDTO dto) { return loaiHangService.create(dto); }

    @PutMapping("/{maLoai}")
    public LoaiHangDTO update(@PathVariable String maLoai, @RequestBody LoaiHangDTO dto) {
        return loaiHangService.update(maLoai, dto);
    }

    @DeleteMapping("/{maLoai}")
    public ResponseEntity<Void> delete(@PathVariable String maLoai) {
        loaiHangService.delete(maLoai);
        return ResponseEntity.noContent().build();
    }
}
