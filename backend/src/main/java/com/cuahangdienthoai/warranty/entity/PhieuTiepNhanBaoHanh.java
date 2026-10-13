package com.cuahangdienthoai.warranty.entity;

import com.cuahangdienthoai.employee.entity.NhanVien;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PhieuTiepNhanBaoHanh")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhieuTiepNhanBaoHanh {
    @Id
    @Column(name = "MATN", length = 15)
    private String maTN;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MABH", nullable = false)
    private BaoHanh baoHanh;

    @Column(name = "NGAYNHAN", nullable = false)
    @Builder.Default
    private LocalDateTime ngayNhan = LocalDateTime.now();

    @Column(name = "TINHTRANGLOI", length = 255, nullable = false)
    private String tinhTrangLoi;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANV_TIEPNHAN", nullable = false)
    private NhanVien nhanVienTiepNhan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANV_KYTHUAT")
    private NhanVien nhanVienKyThuat;

    @Column(name = "NGAYHENTRA")
    private LocalDateTime ngayHenTra;

    @Column(name = "NGAYTRA")
    private LocalDateTime ngayTra;

    @Column(name = "KETQUA", length = 255)
    private String ketQua;

    @Column(name = "CHIPHI", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal chiPhi = BigDecimal.ZERO;

    @Column(name = "TRANGTHAI", length = 20, nullable = false)
    @Builder.Default
    private String trangThai = "tiep_nhan"; // 'tiep_nhan','dang_sua','cho_linh_kien','hoan_thanh','da_tra'
}
