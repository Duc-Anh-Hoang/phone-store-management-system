package com.cuahangdienthoai.warranty.controller;

import com.cuahangdienthoai.warranty.dto.TraHangDTO;
import com.cuahangdienthoai.warranty.service.TraHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trahang")
@RequiredArgsConstructor
public class TraHangController {

    private final TraHangService traHangService;

    @GetMapping
    public List<TraHangDTO> getAll() {
        return traHangService.getAll();
    }

    @GetMapping("/{maTR}")
    public TraHangDTO getById(@PathVariable String maTR) {
        return traHangService.getById(maTR);
    }

    @GetMapping("/hoadon/{soHD}")
    public List<TraHangDTO> getByHoaDon(@PathVariable String soHD) {
        return traHangService.getByHoaDon(soHD);
    }

    @PostMapping
    public TraHangDTO create(@RequestBody TraHangDTO dto) {
        return traHangService.create(dto);
    }

    @DeleteMapping("/{maTR}")
    public ResponseEntity<Void> delete(@PathVariable String maTR) {
        traHangService.delete(maTR);
        return ResponseEntity.noContent().build();
    }
}
