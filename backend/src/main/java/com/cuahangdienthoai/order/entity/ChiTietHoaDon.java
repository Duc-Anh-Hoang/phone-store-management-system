package com.cuahangdienthoai.order.entity;

import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.supplier.entity.Imei;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietHoaDon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietHoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MACTHD")
    private Integer maCTHD;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOHD", nullable = false)
    private HoaDon hoaDon;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MAHANG", nullable = false)
    private MatHang matHang;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MAIMEI")
    private Imei imei;

    @Column(name = "SLBAN", nullable = false)
    private int slBan;

    @Column(name = "DONGIA_BAN", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaBan;
}
