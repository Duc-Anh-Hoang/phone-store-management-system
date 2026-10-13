package com.cuahangdienthoai.order.entity;

import com.cuahangdienthoai.customer.entity.KhachHang;
import com.cuahangdienthoai.employee.entity.NhanVien;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "HoaDon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoaDon {
    @Id
    @Column(name = "SOHD", length = 15)
    private String soHD;

    @Column(name = "NGAYLAP", nullable = false)
    @Builder.Default
    private LocalDateTime ngayLap = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANV", nullable = false)
    private NhanVien nhanVien;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MAKM")
    private KhuyenMai khuyenMai;

    @Column(name = "KENHBAN", length = 10, nullable = false)
    @Builder.Default
    private String kenhBan = "tai_quay"; // 'tai_quay', 'online'

    @Column(name = "TONGTIEN", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal tongTien = BigDecimal.ZERO;

    @Column(name = "TIENGIAMGIA", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal tienGiamGia = BigDecimal.ZERO;

    @Column(name = "PHUONGTHUCTHANHTOAN", length = 20, nullable = false)
    private String phuongThucThanhToan; // 'tien_mat', 'chuyen_khoan', 'the'
}
