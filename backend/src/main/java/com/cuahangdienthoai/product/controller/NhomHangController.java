package com.cuahangdienthoai.product.controller;

import com.cuahangdienthoai.product.dto.NhomHangDTO;
import com.cuahangdienthoai.product.service.NhomHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhomhang")
@RequiredArgsConstructor
public class NhomHangController {
    private final NhomHangService nhomHangService;

    @GetMapping
    public List<NhomHangDTO> getAll() { return nhomHangService.getAll(); }

    @GetMapping("/{maNhom}")
    public NhomHangDTO getById(@PathVariable String maNhom) { return nhomHangService.getById(maNhom); }

    @PostMapping
    public NhomHangDTO create(@RequestBody NhomHangDTO dto) { return nhomHangService.create(dto); }

    @PutMapping("/{maNhom}")
    public NhomHangDTO update(@PathVariable String maNhom, @RequestBody NhomHangDTO dto) {
        return nhomHangService.update(maNhom, dto);
    }

    @DeleteMapping("/{maNhom}")
    public ResponseEntity<Void> delete(@PathVariable String maNhom) {
        nhomHangService.delete(maNhom);
        return ResponseEntity.noContent().build();
    }
}
