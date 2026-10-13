package com.cuahangdienthoai.employee.controller;

import com.cuahangdienthoai.employee.dto.PhanQuyenDTO;
import com.cuahangdienthoai.employee.service.PhanQuyenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phanquyen")
@RequiredArgsConstructor
public class PhanQuyenController {

    private final PhanQuyenService phanQuyenService;

    @GetMapping
    public List<PhanQuyenDTO> getAll() { return phanQuyenService.getAll(); }

    @GetMapping("/{maQuyen}")
    public PhanQuyenDTO getById(@PathVariable String maQuyen) { return phanQuyenService.getById(maQuyen); }

    @PostMapping
    public PhanQuyenDTO create(@RequestBody PhanQuyenDTO dto) { return phanQuyenService.create(dto); }

    @PutMapping("/{maQuyen}")
    public PhanQuyenDTO update(@PathVariable String maQuyen, @RequestBody PhanQuyenDTO dto) {
        return phanQuyenService.update(maQuyen, dto);
    }

    @DeleteMapping("/{maQuyen}")
    public ResponseEntity<Void> delete(@PathVariable String maQuyen) {
        phanQuyenService.delete(maQuyen);
        return ResponseEntity.noContent().build();
    }
}
