package com.cuahangdienthoai.order.controller;

import com.cuahangdienthoai.order.dto.HoaDonDTO;
import com.cuahangdienthoai.order.service.HoaDonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoadon")
@RequiredArgsConstructor
public class HoaDonController {

    private final HoaDonService hoaDonService;

    @GetMapping
    public List<HoaDonDTO> getAll() { return hoaDonService.getAll(); }

    @GetMapping("/{soHD}")
    public HoaDonDTO getById(@PathVariable String soHD) { return hoaDonService.getById(soHD); }

    @GetMapping("/khachhang/{maKH}")
    public List<HoaDonDTO> getByKhachHang(@PathVariable String maKH) { return hoaDonService.getByKhachHang(maKH); }

    @PostMapping
    public HoaDonDTO create(@Valid @RequestBody HoaDonDTO dto) { return hoaDonService.create(dto); }

    @DeleteMapping("/{soHD}")
    public ResponseEntity<Void> delete(@PathVariable String soHD) {
        hoaDonService.delete(soHD);
        return ResponseEntity.noContent().build();
    }
}
