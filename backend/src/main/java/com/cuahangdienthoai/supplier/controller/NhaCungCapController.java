package com.cuahangdienthoai.supplier.controller;

import com.cuahangdienthoai.supplier.dto.NhaCungCapDTO;
import com.cuahangdienthoai.supplier.service.NhaCungCapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhacungcap")
@RequiredArgsConstructor
public class NhaCungCapController {

    private final NhaCungCapService nhaCungCapService;

    @GetMapping
    public List<NhaCungCapDTO> getAll() { return nhaCungCapService.getAll(); }

    @GetMapping("/{maNCC}")
    public NhaCungCapDTO getById(@PathVariable String maNCC) { return nhaCungCapService.getById(maNCC); }

    @PostMapping
    public NhaCungCapDTO create(@RequestBody NhaCungCapDTO dto) { return nhaCungCapService.create(dto); }

    @PutMapping("/{maNCC}")
    public NhaCungCapDTO update(@PathVariable String maNCC, @RequestBody NhaCungCapDTO dto) {
        return nhaCungCapService.update(maNCC, dto);
    }

    @DeleteMapping("/{maNCC}")
    public ResponseEntity<Void> delete(@PathVariable String maNCC) {
        nhaCungCapService.delete(maNCC);
        return ResponseEntity.noContent().build();
    }
}
