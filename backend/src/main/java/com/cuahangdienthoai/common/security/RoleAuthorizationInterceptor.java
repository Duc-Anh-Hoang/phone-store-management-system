package com.cuahangdienthoai.common.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class RoleAuthorizationInterceptor implements HandlerInterceptor {

    private final TokenService tokenService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        // 1. Luôn cho phép OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // 2. Danh sách các API công khai (Public - B1)
        if (isPublicEndpoint(method, uri)) {
            return true;
        }

        // 3. Với các API quản trị, kiểm tra Token xác thực
        String token = resolveToken(request);
        if (token == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"error\":\"Chưa đăng nhập. Vui lòng đăng nhập tài khoản quản trị.\"}");
            return false;
        }

        TokenService.TokenInfo tokenInfo = tokenService.getTokenInfo(token);
        if (tokenInfo == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"error\":\"Phiên làm việc đã hết hạn hoặc không hợp lệ.\"}");
            return false;
        }

        String role = tokenInfo.getRole();
        // ADMIN và QUANLY có toàn quyền truy cập tất cả API
        if ("ADMIN".equals(role) || "QUANLY".equals(role)) {
            return true;
        }

        // 4. Kiểm tra phân quyền chi tiết theo vai trò (Bảng Mục 5.1 plan.md)
        Set<String> allowedRoles = resolveAllowedRoles(uri);
        if (allowedRoles != null && !allowedRoles.contains(role)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"error\":\"Tài khoản vai trò '" + role + "' không có quyền truy cập chức năng này.\"}");
            return false;
        }

        return true;
    }

    private boolean isPublicEndpoint(String method, String uri) {
        if (uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/customer-login")) {
            return true;
        }
        if (uri.startsWith("/api/orders/phone") || uri.startsWith("/api/orders")) {
            return true;
        }
        if (uri.startsWith("/api/baohanh/trangthai")) {
            return true;
        }
        if (uri.startsWith("/api/khachhang/sdt")) {
            return true;
        }
        if (uri.startsWith("/api/hoadon/khachhang")) {
            return true;
        }
        if ("GET".equalsIgnoreCase(method)) {
            if (uri.startsWith("/api/mathang") ||
                uri.startsWith("/api/nhomhang") ||
                uri.startsWith("/api/loaihang") ||
                uri.startsWith("/api/khuyenmai/hoatdong") ||
                uri.startsWith("/api/thamso")) {
                return true;
            }
        }
        return false;
    }

    private Set<String> resolveAllowedRoles(String uri) {
        if (uri.startsWith("/api/donhangonline") || uri.startsWith("/api/donhang")) {
            return Set.of("BANHANG", "QUANLY", "ADMIN");
        }
        if (uri.startsWith("/api/imei")) {
            return Set.of("BANHANG", "KHO", "QUANLY", "ADMIN");
        }
        if (uri.startsWith("/api/hoadon")) {
            return Set.of("BANHANG", "THUNGAN", "QUANLY", "ADMIN");
        }
        if (uri.startsWith("/api/trahang")) {
            return Set.of("THUNGAN", "QUANLY", "ADMIN");
        }
        if (uri.startsWith("/api/baohanh") || uri.startsWith("/api/tiepnhanbaohanh")) {
            return Set.of("KYTHUAT", "QUANLY", "ADMIN");
        }
        if (uri.startsWith("/api/nhacungcap") || uri.startsWith("/api/phieunhap")) {
            return Set.of("KHO", "QUANLY", "ADMIN");
        }
        if (uri.startsWith("/api/khachhang")) {
            return Set.of("BANHANG", "QUANLY", "ADMIN");
        }
        // Các chức năng Quản trị & Cấu hình hệ thống (dashboard, nhân viên, tài khoản, phân quyền, tham số, nhóm/loại, thuộc tính)
        return Set.of("QUANLY", "ADMIN");
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        String xAuth = request.getHeader("X-Auth-Token");
        if (xAuth != null && !xAuth.trim().isEmpty()) {
            return xAuth.trim();
        }
        return null;
    }
}
