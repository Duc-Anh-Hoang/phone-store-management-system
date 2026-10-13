package com.cuahangdienthoai.employee.controller;

import com.cuahangdienthoai.employee.dto.TaiKhoanDTO;
import com.cuahangdienthoai.employee.service.TaiKhoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/taikhoan")
@RequiredArgsConstructor
public class TaiKhoanController {

    private final TaiKhoanService taiKhoanService;

    @GetMapping
    public List<TaiKhoanDTO> getAll() { return taiKhoanService.getAll(); }

    @GetMapping("/{username}")
    public TaiKhoanDTO getById(@PathVariable String username) { return taiKhoanService.getById(username); }

    @PostMapping
    public TaiKhoanDTO create(@RequestBody Map<String, String> body) {
        return taiKhoanService.create(
                body.get("maNV"), body.get("maQuyen"),
                body.get("username"), body.get("passwordHash")
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            TaiKhoanDTO dto = taiKhoanService.login(body.get("username"), body.get("password"));
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{username}/trangthai")
    public TaiKhoanDTO updateTrangThai(@PathVariable String username, @RequestBody Map<String, String> body) {
        return taiKhoanService.updateTrangThai(username, body.get("trangThai"));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<Void> delete(@PathVariable String username) {
        taiKhoanService.delete(username);
        return ResponseEntity.noContent().build();
    }
}
