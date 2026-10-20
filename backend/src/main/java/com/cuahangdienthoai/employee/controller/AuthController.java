package com.cuahangdienthoai.employee.controller;

import com.cuahangdienthoai.common.security.TokenService;
import com.cuahangdienthoai.customer.dto.KhachHangDTO;
import com.cuahangdienthoai.customer.service.KhachHangService;
import com.cuahangdienthoai.employee.dto.TaiKhoanDTO;
import com.cuahangdienthoai.employee.service.TaiKhoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TaiKhoanService taiKhoanService;
    private final KhachHangService khachHangService;
    private final TokenService tokenService;

    /**
     * API Đăng nhập chung: Tự động phân luồng:
     * - Nhân viên/Admin -> chuyển đến admin.html (kèm token xác thực)
     * - Khách hàng (User) -> ở lại index.html
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        if (username == null) username = credentials.get("tenDangNhap");
        String password = credentials.get("password");
        if (password == null) password = credentials.get("matKhau");

        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập tên đăng nhập hoặc số điện thoại"));
        }

        username = username.trim();

        // 1. Thử xác thực với tài khoản Nhân viên / Quản trị viên
        try {
            TaiKhoanDTO tk = taiKhoanService.login(username, password != null ? password : "");
            String role = tk.getMaQuyen() != null ? tk.getMaQuyen().toUpperCase() : "STAFF";
            String token = tokenService.createToken(username, role);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "type", "staff",
                    "role", role,
                    "redirect", "admin.html",
                    "message", "Đăng nhập Quản trị viên thành công!",
                    "user", tk
            ));
        } catch (Exception exStaff) {
            // Nếu không phải nhân viên, kiểm tra xem có phải tài khoản Khách hàng (Người dùng) không
            try {
                KhachHangDTO kh = null;
                try {
                    kh = khachHangService.getBySdt(username);
                } catch (Exception ignored) {
                    kh = khachHangService.getById(username);
                }

                if (kh != null) {
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "type", "customer",
                            "role", "CUSTOMER",
                            "redirect", "index.html",
                            "message", "Đăng nhập Khách hàng thành công!",
                            "user", kh
                    ));
                }
            } catch (Exception ignored) {}

            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", exStaff.getMessage()
            ));
        }
    }

    /**
     * API Đăng nhập riêng cho Khách hàng qua SĐT
     */
    @PostMapping("/customer-login")
    public ResponseEntity<?> customerLogin(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || phone.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập số điện thoại"));
        }

        try {
            KhachHangDTO kh = khachHangService.getBySdt(phone.trim());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "type", "customer",
                    "role", "CUSTOMER",
                    "redirect", "index.html",
                    "message", "Chào mừng " + kh.getHoTen() + " quay trở lại!",
                    "user", kh
            ));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "error", "Số điện thoại chưa có trên hệ thống. Quý khách vui lòng đặt hàng để đăng ký!"
            ));
        }
    }
}
