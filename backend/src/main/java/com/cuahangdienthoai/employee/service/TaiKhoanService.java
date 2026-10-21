package com.cuahangdienthoai.employee.service;

import com.cuahangdienthoai.employee.dto.TaiKhoanDTO;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.entity.PhanQuyen;
import com.cuahangdienthoai.employee.entity.TaiKhoan;
import com.cuahangdienthoai.employee.repository.NhanVienRepository;
import com.cuahangdienthoai.employee.repository.PhanQuyenRepository;
import com.cuahangdienthoai.employee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaiKhoanService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final NhanVienRepository nhanVienRepository;
    private final PhanQuyenRepository phanQuyenRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<TaiKhoanDTO> getAll() {
        return taiKhoanRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TaiKhoanDTO getById(String username) {
        return taiKhoanRepository.findById(username)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + username));
    }

    @Transactional
    public TaiKhoanDTO create(String maNV, String maQuyen, String username, String password) {
        if (password == null || password.trim().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu không được để trống và phải có ít nhất 6 ký tự");
        }
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên đăng nhập không được để trống");
        }
        NhanVien nv = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại: " + maNV));
        PhanQuyen pq = phanQuyenRepository.findById(maQuyen)
                .orElseThrow(() -> new IllegalArgumentException("Phân quyền không tồn tại: " + maQuyen));

        String encodedPassword = (password.startsWith("$2a$") || password.startsWith("$2b$"))
                ? password
                : passwordEncoder.encode(password);

        TaiKhoan tk = TaiKhoan.builder()
                .username(username.trim())
                .passwordHash(encodedPassword)
                .nhanVien(nv)
                .phanQuyen(pq)
                .trangThai("hoat_dong")
                .build();
        return toDTO(taiKhoanRepository.save(tk));
    }

    @Transactional
    public TaiKhoanDTO updateTrangThai(String username, String trangThai) {
        TaiKhoan tk = taiKhoanRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + username));
        tk.setTrangThai(trangThai);
        return toDTO(taiKhoanRepository.save(tk));
    }

    public TaiKhoanDTO login(String username, String password) {
        TaiKhoan tk = taiKhoanRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập không tồn tại: " + username));

        boolean matched = false;
        String currentHash = tk.getPasswordHash();
        if (currentHash != null) {
            if (currentHash.startsWith("$2a$") || currentHash.startsWith("$2b$")) {
                matched = passwordEncoder.matches(password, currentHash);
            } else {
                // Hỗ trợ đăng nhập mật khẩu thô và tự động nâng cấp sang BCrypt (B2)
                matched = currentHash.equals(password);
                if (matched) {
                    tk.setPasswordHash(passwordEncoder.encode(password));
                    taiKhoanRepository.save(tk);
                }
            }
        }

        if (!matched) {
            throw new RuntimeException("Mật khẩu không chính xác");
        }
        if (!"hoat_dong".equalsIgnoreCase(tk.getTrangThai())) {
            throw new RuntimeException("Tài khoản đang bị khóa");
        }
        return toDTO(tk);
    }

    @Transactional
    public void delete(String username) {
        taiKhoanRepository.deleteById(username);
    }

    private TaiKhoanDTO toDTO(TaiKhoan e) {
        return TaiKhoanDTO.builder()
                .username(e.getUsername())
                .maNV(e.getNhanVien().getMaNV())
                .tenNhanVien(e.getNhanVien().getHoTen())
                .maQuyen(e.getPhanQuyen().getMaQuyen())
                .tenQuyen(e.getPhanQuyen().getTenQuyen())
                .trangThai(e.getTrangThai())
                .ngayTao(e.getNgayTao() != null ? e.getNgayTao().toString() : null)
                .build();
    }
}
