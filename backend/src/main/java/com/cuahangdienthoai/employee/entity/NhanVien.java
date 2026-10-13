package com.cuahangdienthoai.employee.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NhanVien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhanVien {

    @Id
    @Column(name = "MANV", length = 10)
    private String maNV;

    @Column(name = "HOTEN", length = 100, nullable = false)
    private String hoTen;

    @Column(name = "CHUCVU", length = 50, nullable = false)
    private String chucVu;

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "EMAIL", length = 100)
    private String email;

    @Column(name = "NGAYVAOLAM", nullable = false)
    @Builder.Default
    private LocalDateTime ngayVaoLam = LocalDateTime.now();

    @Column(name = "TRANGTHAI", length = 10, nullable = false)
    @Builder.Default
    private String trangThai = "dang_lam"; // 'dang_lam', 'da_nghi'
}
