package com.cuahangdienthoai.warranty.controller;

import com.cuahangdienthoai.warranty.dto.BaoHanhDTO;
import com.cuahangdienthoai.warranty.repository.BaoHanhRepository;
import com.cuahangdienthoai.warranty.repository.BaoHanhTrangThaiProjection;
import com.cuahangdienthoai.warranty.service.BaoHanhService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/baohanh")
@RequiredArgsConstructor
public class BaoHanhController {

    private final BaoHanhService baoHanhService;
    private final BaoHanhRepository baoHanhRepository;

    @GetMapping
    public List<BaoHanhDTO> getAll() { return baoHanhService.getAll(); }

    @GetMapping("/{maBH}")
    public BaoHanhDTO getById(@PathVariable String maBH) { return baoHanhService.getById(maBH); }

    @GetMapping("/imei/{maIMEI}")
    public BaoHanhDTO getByIMEI(@PathVariable String maIMEI) { return baoHanhService.getByIMEI(maIMEI); }

    @GetMapping("/trangthai/{query}")
    public ResponseEntity<BaoHanhTrangThaiProjection> getTrangThai(@PathVariable String query) {
        return baoHanhRepository.findTrangThaiByImeiOrSoImei(query)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{maBH}")
    public ResponseEntity<Void> delete(@PathVariable String maBH) {
        baoHanhService.delete(maBH);
        return ResponseEntity.noContent().build();
    }
}
