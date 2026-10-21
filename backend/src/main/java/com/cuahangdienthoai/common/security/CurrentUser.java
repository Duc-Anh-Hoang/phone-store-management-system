package com.cuahangdienthoai.common.security;

import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.entity.TaiKhoan;
import com.cuahangdienthoai.employee.repository.TaiKhoanRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final TokenService tokenService;
    private final TaiKhoanRepository taiKhoanRepository;

    public NhanVien getCurrentNhanVien() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy phiên làm việc");
        }
        HttpServletRequest request = attrs.getRequest();

        TokenService.TokenInfo tokenInfo = (TokenService.TokenInfo) request.getAttribute("currentUser");
        if (tokenInfo == null) {
            String token = resolveToken(request);
            if (token != null) {
                tokenInfo = tokenService.getTokenInfo(token);
            }
        }

        if (tokenInfo == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện thao tác");
        }

        String username = tokenInfo.getUsername();
        if (username == null || username.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token không hợp lệ");
        }

        TaiKhoan tk = taiKhoanRepository.findById(username).orElse(null);
        if (tk == null || tk.getNhanVien() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản '" + username + "' chưa được liên kết với nhân viên nào");
        }

        return tk.getNhanVien();
    }

    public String getCurrentMaNV() {
        return getCurrentNhanVien().getMaNV();
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
