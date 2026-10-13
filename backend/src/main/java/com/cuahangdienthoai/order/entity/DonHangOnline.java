package com.cuahangdienthoai.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "DonHangOnline")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonHangOnline {

    @Id
    @Column(name = "MADH", length = 15)
    private String maDH;

    @Column(name = "NGAYDAT", nullable = false)
    @Builder.Default
    private LocalDateTime ngayDat = LocalDateTime.now();

    @Column(name = "MAKH", length = 10, nullable = false)
    private String maKH;

    @Column(name = "TENNGUOINHAN", length = 100, nullable = false)
    private String tenNguoiNhan;

    @Column(name = "SDTNGUOINHAN", length = 15, nullable = false)
    private String sdtNguoiNhan;

    @Column(name = "DIACHIGIAO", length = 255, nullable = false)
    private String diaChiGiao;

    @Column(name = "PHUONGTHUCTHANHTOAN", length = 20, nullable = false)
    private String phuongThucThanhToan; // 'cod', 'chuyen_khoan', 'the'

    @Column(name = "TONGTIEN", precision = 18, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal tongTien = BigDecimal.ZERO;

    @Column(name = "TRANGTHAI", length = 20, nullable = false)
    @Builder.Default
    private String trangThai = "cho_xac_nhan"; // 'cho_xac_nhan', 'da_xac_nhan', 'dang_giao', 'hoan_thanh', 'da_huy'

    @Column(name = "MANV", length = 10)
    private String maNV;

    @Column(name = "SOHD", length = 15)
    private String soHD;
}
