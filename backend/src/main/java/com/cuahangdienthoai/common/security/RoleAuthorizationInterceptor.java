package com.cuahangdienthoai.common.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
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

        // 2. Danh sách các API công khai (Public)
        if (isPublicEndpoint(method, uri)) {
            return true;
        }

        // 3. Với các API bảo mật, kiểm tra Token xác thực
        String token = resolveToken(request);
        if (token == null) {
            sendUnauthorized(response, "Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
            return false;
        }

        TokenService.TokenInfo tokenInfo = tokenService.getTokenInfo(token);
        if (tokenInfo == null) {
            sendUnauthorized(response, "Phiên làm việc đã hết hạn hoặc không hợp lệ.");
            return false;
        }

        // Lưu thông tin người dùng vào request để controller sử dụng
        request.setAttribute("currentUser", tokenInfo);
        request.setAttribute("currentRole", tokenInfo.getRole());
        request.setAttribute("currentUsername", tokenInfo.getUsername());
        request.setAttribute("currentMaKH", tokenInfo.getMaKH());

        String role = tokenInfo.getRole();

        // ADMIN và QUANLY có toàn quyền truy cập tất cả API
        if ("ADMIN".equals(role) || "QUANLY".equals(role)) {
            return true;
        }

        // 4. Xử lý riêng cho vai trò KHÁCH HÀNG (CUSTOMER)
        if ("CUSTOMER".equals(role)) {
            if ("GET".equalsIgnoreCase(method)) {
                // Khách chỉ được xem thông tin khách hàng của chính mình (qua SĐT trùng với username đăng nhập)
                if (uri.startsWith("/api/khachhang/sdt/")) {
                    String reqPhone = extractPathParameter(uri, "/api/khachhang/sdt/");
                    if (reqPhone.equalsIgnoreCase(tokenInfo.getUsername())) {
                        return true;
                    }
                    sendForbidden(response, "Khách hàng chỉ có quyền xem thông tin của chính mình.");
                    return false;
                }

                // Khách chỉ được xem danh sách hóa đơn của chính mình (qua maKH)
                if (uri.startsWith("/api/hoadon/khachhang/")) {
                    String reqMaKH = extractPathParameter(uri, "/api/hoadon/khachhang/");
                    if (tokenInfo.getMaKH() != null && tokenInfo.getMaKH().equalsIgnoreCase(reqMaKH)) {
                        return true;
                    }
                    sendForbidden(response, "Khách hàng chỉ có quyền xem hóa đơn của chính mình.");
                    return false;
                }
            }

            // Khách hàng tuyệt đối không được truy cập vào bất kỳ API quản trị nào khác
            sendForbidden(response, "Tài khoản khách hàng không có quyền truy cập chức năng này.");
            return false;
        }

        // 5. Kiểm tra phân quyền chi tiết cho các vai trò Nhân viên nội bộ (M3)
        Set<String> allowedRoles = resolveAllowedRoles(method, uri);
        if (allowedRoles != null && !allowedRoles.contains(role)) {
            sendForbidden(response, "Tài khoản vai trò '" + role + "' không có quyền truy cập chức năng này.");
            return false;
        }

        return true;
    }

    private boolean isPublicEndpoint(String method, String uri) {
        // Đăng nhập
        if (uri.equals("/api/auth/login") || uri.equals("/api/auth/customer-login")) {
            return true;
        }

        // Đặt hàng công khai từ Landing Page: POST /api/orders
        if ("POST".equalsIgnoreCase(method) && (uri.equals("/api/orders") || uri.equals("/api/orders/"))) {
            return true;
        }

        // Tra cứu công khai (chỉ GET)
        if ("GET".equalsIgnoreCase(method)) {
            // GET /api/orders/phone/{phone}
            if (uri.startsWith("/api/orders/phone/")) {
                return true;
            }
            // GET /api/orders/{id}
            if (uri.startsWith("/api/orders/") && !uri.equals("/api/orders") && !uri.equals("/api/orders/")) {
                return true;
            }
            // GET /api/baohanh/trangthai/{imei}
            if (uri.startsWith("/api/baohanh/trangthai/")) {
                return true;
            }
            // Dữ liệu danh mục chung hiển thị trên Web
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

    private Set<String> resolveAllowedRoles(String method, String uri) {
        // (b) M3: Cho BANHANG, THUNGAN, KHO, KYTHUAT GET /api/nhanvien/{maNV} và /api/nhanvien
        if (uri.startsWith("/api/nhanvien")) {
            if ("GET".equalsIgnoreCase(method)) {
                return Set.of("BANHANG", "THUNGAN", "KHO", "KYTHUAT", "QUANLY", "ADMIN");
            }
            return Set.of("QUANLY", "ADMIN");
        }

        // (a) M3: /api/donhangonline thêm THUNGAN
        if (uri.startsWith("/api/donhangonline") || uri.startsWith("/api/donhang")) {
            return Set.of("BANHANG", "THUNGAN", "QUANLY", "ADMIN");
        }

        // (c) M3: KYTHUAT thêm GET /api/hoadon/{soHD}
        if (uri.startsWith("/api/hoadon")) {
            if ("GET".equalsIgnoreCase(method) && uri.matches("^/api/hoadon/[^/]+$")) {
                return Set.of("BANHANG", "THUNGAN", "KYTHUAT", "QUANLY", "ADMIN");
            }
            return Set.of("BANHANG", "THUNGAN", "QUANLY", "ADMIN");
        }

        if (uri.startsWith("/api/imei")) {
            return Set.of("BANHANG", "KHO", "QUANLY", "ADMIN");
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

        // Các chức năng Quản trị & Cấu hình hệ thống (dashboard, tài khoản, phân quyền, tham số...)
        return Set.of("QUANLY", "ADMIN");
    }

    private String extractPathParameter(String uri, String prefix) {
        String sub = uri.substring(prefix.length());
        int qIdx = sub.indexOf('?');
        if (qIdx >= 0) {
            sub = sub.substring(0, qIdx);
        }
        int slashIdx = sub.indexOf('/');
        if (slashIdx >= 0) {
            sub = sub.substring(0, slashIdx);
        }
        return sub.trim();
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"error\":\"" + message + "\"}");
    }

    private void sendForbidden(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"error\":\"" + message + "\"}");
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
