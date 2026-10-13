package com.cuahangdienthoai.supplier.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietPhieuNhap")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietPhieuNhap {

    @EmbeddedId
    private ChiTietPhieuNhapId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("soPNhap")
    @JoinColumn(name = "SOPN")
    private PhieuNhap phieuNhap;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("maHang")
    @JoinColumn(name = "MAHANG")
    private com.cuahangdienthoai.product.entity.MatHang matHang;

    @Column(name = "SLNHAP", nullable = false)
    private int slNhap;

    @Column(name = "DONGIA_NHAP", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaNhap;
}
