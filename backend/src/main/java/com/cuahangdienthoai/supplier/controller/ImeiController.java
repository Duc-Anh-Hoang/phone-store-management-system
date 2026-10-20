package com.cuahangdienthoai.supplier.controller;

import com.cuahangdienthoai.supplier.dto.ImeiDTO;
import com.cuahangdienthoai.supplier.repository.ImeiConHangProjection;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import com.cuahangdienthoai.supplier.service.ImeiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/imei")
@RequiredArgsConstructor
public class ImeiController {

    private final ImeiService imeiService;
    private final ImeiRepository imeiRepository;

    @GetMapping
    public List<ImeiDTO> getAll() { return imeiService.getAll(); }

    @GetMapping("/trangthai/{trangThai}")
    public List<ImeiDTO> getByTrangThai(@PathVariable String trangThai) { return imeiService.getByTrangThai(trangThai); }

    @GetMapping("/mathang/{maHang}")
    public List<ImeiDTO> getByMatHang(@PathVariable String maHang) { return imeiService.getByMatHang(maHang); }

    @GetMapping("/available/{maHang}")
    public ResponseEntity<List<ImeiConHangProjection>> getAvailable(@PathVariable String maHang) {
        return ResponseEntity.ok(imeiRepository.findAvailableByMaHang(maHang));
    }

    @GetMapping("/soimei/{soIMEI}")
    public ImeiDTO getBySoIMEI(@PathVariable String soIMEI) { return imeiService.getBySoIMEI(soIMEI); }

    @PutMapping("/{maIMEI}/trangthai")
    public ImeiDTO updateTrangThai(@PathVariable String maIMEI, @RequestBody Map<String, String> body) {
        return imeiService.updateTrangThai(maIMEI, body.get("trangThai"));
    }
}
