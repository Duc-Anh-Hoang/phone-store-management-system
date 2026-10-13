package com.cuahangdienthoai.order.controller;

import com.cuahangdienthoai.order.dto.KhuyenMaiDTO;
import com.cuahangdienthoai.order.service.KhuyenMaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khuyenmai")
@RequiredArgsConstructor
public class KhuyenMaiController {

    private final KhuyenMaiService khuyenMaiService;

    @GetMapping
    public List<KhuyenMaiDTO> getAll() { return khuyenMaiService.getAll(); }

    @GetMapping("/{maKM}")
    public KhuyenMaiDTO getById(@PathVariable String maKM) { return khuyenMaiService.getById(maKM); }

    @GetMapping("/hoatdong")
    public List<KhuyenMaiDTO> getDangHoatDong() { return khuyenMaiService.getDangHoatDong(); }

    @PostMapping
    public KhuyenMaiDTO create(@RequestBody KhuyenMaiDTO dto) { return khuyenMaiService.create(dto); }

    @PutMapping("/{maKM}")
    public KhuyenMaiDTO update(@PathVariable String maKM, @RequestBody KhuyenMaiDTO dto) {
        return khuyenMaiService.update(maKM, dto);
    }

    @DeleteMapping("/{maKM}")
    public ResponseEntity<Void> delete(@PathVariable String maKM) {
        khuyenMaiService.delete(maKM);
        return ResponseEntity.noContent().build();
    }
}
