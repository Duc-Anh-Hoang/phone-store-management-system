package com.cuahangdienthoai.order.controller;

import com.cuahangdienthoai.order.dto.DonHangOnlineDTO;
import com.cuahangdienthoai.order.service.DonHangOnlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/donhangonline", "/api/donhang"})
@RequiredArgsConstructor
public class DonHangOnlineController {

    private final DonHangOnlineService donHangOnlineService;

    @GetMapping
    public List<DonHangOnlineDTO> getAll() { return donHangOnlineService.getAll(); }

    @GetMapping("/{maDH}")
    public DonHangOnlineDTO getById(@PathVariable String maDH) { return donHangOnlineService.getById(maDH); }

    @GetMapping("/trangthai/{trangThai}")
    public List<DonHangOnlineDTO> getByTrangThai(@PathVariable String trangThai) {
        return donHangOnlineService.getByTrangThai(trangThai);
    }

    @PostMapping
    public DonHangOnlineDTO create(@RequestBody DonHangOnlineDTO dto) { return donHangOnlineService.create(dto); }

    @PutMapping("/{maDH}/trangthai")
    public DonHangOnlineDTO updateTrangThai(@PathVariable String maDH, @RequestBody Map<String, String> body) {
        return donHangOnlineService.updateTrangThai(maDH, body.get("trangThai"));
    }

    @DeleteMapping("/{maDH}")
    public ResponseEntity<Void> delete(@PathVariable String maDH) {
        donHangOnlineService.delete(maDH);
        return ResponseEntity.noContent().build();
    }
}
