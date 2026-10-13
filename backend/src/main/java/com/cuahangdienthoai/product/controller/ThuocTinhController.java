package com.cuahangdienthoai.product.controller;

import com.cuahangdienthoai.product.dto.ChiTietThuocTinhDTO;
import com.cuahangdienthoai.product.dto.ThuocTinhDTO;
import com.cuahangdienthoai.product.service.ThuocTinhService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thuoctinh")
@RequiredArgsConstructor
public class ThuocTinhController {

    private final ThuocTinhService thuocTinhService;

    @GetMapping
    public List<ThuocTinhDTO> getAll() {
        return thuocTinhService.getAll();
    }

    @GetMapping("/{maThuocTinh}")
    public ThuocTinhDTO getById(@PathVariable String maThuocTinh) {
        return thuocTinhService.getById(maThuocTinh);
    }

    @PostMapping
    public ThuocTinhDTO create(@RequestBody ThuocTinhDTO dto) {
        return thuocTinhService.create(dto);
    }

    @PutMapping("/{maThuocTinh}")
    public ThuocTinhDTO update(@PathVariable String maThuocTinh, @RequestBody ThuocTinhDTO dto) {
        return thuocTinhService.update(maThuocTinh, dto);
    }

    @DeleteMapping("/{maThuocTinh}")
    public ResponseEntity<Void> delete(@PathVariable String maThuocTinh) {
        thuocTinhService.delete(maThuocTinh);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mathang/{maHang}")
    public List<ChiTietThuocTinhDTO> getByMatHang(@PathVariable String maHang) {
        return thuocTinhService.getByMatHang(maHang);
    }

    @PostMapping("/chitiet")
    public ChiTietThuocTinhDTO addChiTiet(@RequestBody ChiTietThuocTinhDTO dto) {
        return thuocTinhService.addChiTietThuocTinh(dto);
    }

    @DeleteMapping("/chitiet/{maHang}/{maThuocTinh}")
    public ResponseEntity<Void> deleteChiTiet(@PathVariable String maHang, @PathVariable String maThuocTinh) {
        thuocTinhService.deleteChiTietThuocTinh(maHang, maThuocTinh);
        return ResponseEntity.noContent().build();
    }
}
