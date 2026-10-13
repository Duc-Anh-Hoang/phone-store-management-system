package com.cuahangdienthoai.supplier.entity;

import com.cuahangdienthoai.employee.entity.NhanVien;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PhieuNhap")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhieuNhap {
    @Id
    @Column(name = "SOPN", length = 15)
    private String soPNhap;

    @Column(name = "NGAYNHAP", nullable = false)
    @Builder.Default
    private LocalDateTime ngayNhap = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANCC", nullable = false)
    private NhaCungCap nhaCungCap;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANV", nullable = false)
    private NhanVien nhanVien;
}
