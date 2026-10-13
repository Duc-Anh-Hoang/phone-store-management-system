package com.cuahangdienthoai.common.controller;

import com.cuahangdienthoai.common.dto.ThamSoDTO;
import com.cuahangdienthoai.common.service.ThamSoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thamso")
@RequiredArgsConstructor
public class ThamSoController {

    private final ThamSoService thamSoService;

    @GetMapping
    public List<ThamSoDTO> getAll() {
        return thamSoService.getAll();
    }

    @GetMapping("/{maThamSo}")
    public ThamSoDTO getById(@PathVariable String maThamSo) {
        return thamSoService.getById(maThamSo);
    }

    @PostMapping
    public ThamSoDTO create(@RequestBody ThamSoDTO dto) {
        return thamSoService.create(dto);
    }

    @PutMapping("/{maThamSo}")
    public ThamSoDTO update(@PathVariable String maThamSo, @RequestBody ThamSoDTO dto) {
        return thamSoService.update(maThamSo, dto);
    }

    @DeleteMapping("/{maThamSo}")
    public ResponseEntity<Void> delete(@PathVariable String maThamSo) {
        thamSoService.delete(maThamSo);
        return ResponseEntity.noContent().build();
    }
}
