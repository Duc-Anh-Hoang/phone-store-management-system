package com.cuahangdienthoai.employee.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TaiKhoan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaiKhoan {

    @Id
    @Column(name = "USERNAME", length = 50)
    private String username;

    @Column(name = "PASSWORD_HASH", length = 255, nullable = false)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MANV", nullable = false, unique = true)
    private NhanVien nhanVien;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MAQUYEN", nullable = false)
    private PhanQuyen phanQuyen;

    @Column(name = "TRANGTHAI", length = 10, nullable = false)
    @Builder.Default
    private String trangThai = "hoat_dong"; // 'hoat_dong', 'bi_khoa'

    @Column(name = "NGAYTAO", nullable = false)
    @Builder.Default
    private LocalDateTime ngayTao = LocalDateTime.now();
}
