package com.cuahangdienthoai.supplier.controller;

import com.cuahangdienthoai.supplier.dto.ImeiDTO;
import com.cuahangdienthoai.supplier.service.ImeiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/imei")
@RequiredArgsConstructor
public class ImeiController {

    private final ImeiService imeiService;

    @GetMapping
    public List<ImeiDTO> getAll() { return imeiService.getAll(); }

    @GetMapping("/trangthai/{trangThai}")
    public List<ImeiDTO> getByTrangThai(@PathVariable String trangThai) { return imeiService.getByTrangThai(trangThai); }

    @GetMapping("/mathang/{maHang}")
    public List<ImeiDTO> getByMatHang(@PathVariable String maHang) { return imeiService.getByMatHang(maHang); }

    @GetMapping("/soimei/{soIMEI}")
    public ImeiDTO getBySoIMEI(@PathVariable String soIMEI) { return imeiService.getBySoIMEI(soIMEI); }

    @PutMapping("/{maIMEI}/trangthai")
    public ImeiDTO updateTrangThai(@PathVariable String maIMEI, @RequestBody Map<String, String> body) {
        return imeiService.updateTrangThai(maIMEI, body.get("trangThai"));
    }
}
