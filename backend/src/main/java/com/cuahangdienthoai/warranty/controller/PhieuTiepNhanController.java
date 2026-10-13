package com.cuahangdienthoai.warranty.controller;

import com.cuahangdienthoai.warranty.dto.PhieuTiepNhanDTO;
import com.cuahangdienthoai.warranty.service.PhieuTiepNhanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tiepnhanbaohanh")
@RequiredArgsConstructor
public class PhieuTiepNhanController {

    private final PhieuTiepNhanService phieuTiepNhanService;

    @GetMapping
    public List<PhieuTiepNhanDTO> getAll() { return phieuTiepNhanService.getAll(); }

    @GetMapping("/{maTN}")
    public PhieuTiepNhanDTO getById(@PathVariable String maTN) { return phieuTiepNhanService.getById(maTN); }

    @GetMapping("/trangthai/{trangThai}")
    public List<PhieuTiepNhanDTO> getByTrangThai(@PathVariable String trangThai) {
        return phieuTiepNhanService.getByTrangThai(trangThai);
    }

    @PostMapping
    public PhieuTiepNhanDTO create(@RequestBody PhieuTiepNhanDTO dto) {
        return phieuTiepNhanService.create(dto);
    }

    @PutMapping("/{maTN}/trangthai")
    public PhieuTiepNhanDTO updateTrangThai(@PathVariable String maTN, @RequestBody Map<String, String> body) {
        return phieuTiepNhanService.updateTrangThai(maTN, body.get("trangThai"));
    }
}
