package com.cuahangdienthoai.employee.service;

import com.cuahangdienthoai.employee.dto.TaiKhoanDTO;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.entity.PhanQuyen;
import com.cuahangdienthoai.employee.entity.TaiKhoan;
import com.cuahangdienthoai.employee.repository.NhanVienRepository;
import com.cuahangdienthoai.employee.repository.PhanQuyenRepository;
import com.cuahangdienthoai.employee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
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

    public List<TaiKhoanDTO> getAll() {
        return taiKhoanRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TaiKhoanDTO getById(String username) {
        return taiKhoanRepository.findById(username)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + username));
    }

    @Transactional
    public TaiKhoanDTO create(String maNV, String maQuyen, String username, String passwordHash) {
        NhanVien nv = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại: " + maNV));
        PhanQuyen pq = phanQuyenRepository.findById(maQuyen)
                .orElseThrow(() -> new RuntimeException("Phân quyền không tồn tại: " + maQuyen));
        TaiKhoan tk = TaiKhoan.builder()
                .username(username)
                .passwordHash(passwordHash)
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
        if (!tk.getPasswordHash().equals(password)) {
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
