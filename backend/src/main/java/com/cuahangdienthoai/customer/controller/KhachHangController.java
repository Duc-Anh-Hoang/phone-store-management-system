package com.cuahangdienthoai.customer.controller;

import com.cuahangdienthoai.customer.dto.KhachHangDTO;
import com.cuahangdienthoai.customer.service.KhachHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khachhang")
@RequiredArgsConstructor
public class KhachHangController {

    private final KhachHangService khachHangService;

    @GetMapping
    public List<KhachHangDTO> getAll() { return khachHangService.getAll(); }

    @GetMapping("/{maKH}")
    public KhachHangDTO getById(@PathVariable String maKH) { return khachHangService.getById(maKH); }

    @GetMapping("/sdt/{sdt}")
    public KhachHangDTO getBySdt(@PathVariable String sdt) { return khachHangService.getBySdt(sdt); }

    @PostMapping
    public KhachHangDTO create(@RequestBody KhachHangDTO dto) { return khachHangService.create(dto); }

    @PutMapping("/{maKH}")
    public KhachHangDTO update(@PathVariable String maKH, @RequestBody KhachHangDTO dto) {
        return khachHangService.update(maKH, dto);
    }

    @DeleteMapping("/{maKH}")
    public ResponseEntity<Void> delete(@PathVariable String maKH) {
        khachHangService.delete(maKH);
        return ResponseEntity.noContent().build();
    }
}
