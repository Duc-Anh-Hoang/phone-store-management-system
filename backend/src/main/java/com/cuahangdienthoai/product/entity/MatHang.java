package com.cuahangdienthoai.product.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "MatHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MatHang {

    @Id
    @Column(name = "MAHANG", length = 10)
    private String maHang;

    @Column(name = "TENHANG", length = 100, nullable = false)
    private String tenHang;

    @Column(name = "DONGIA", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;

    @Column(name = "DVT", length = 20, nullable = false)
    @Builder.Default
    private String dvt = "Cái";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANHOM", nullable = false)
    private NhomHang nhomHang;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MALOAI", nullable = false)
    private LoaiHang loaiHang;

    @Column(name = "QUANLYIMEI", nullable = false)
    private boolean quanLyImei;

    @Column(name = "THOIHANBAOHANH", nullable = false)
    private int thoiHanBaoHanh;
}
