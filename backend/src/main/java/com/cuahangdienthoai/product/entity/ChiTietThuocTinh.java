package com.cuahangdienthoai.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ChiTietThuocTinh")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietThuocTinh {

    @EmbeddedId
    private ChiTietThuocTinhId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maHang")
    @JoinColumn(name = "MAHANG")
    private MatHang matHang;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("maThuocTinh")
    @JoinColumn(name = "MATHUOCTINH")
    private ThuocTinh thuocTinh;

    @Column(name = "GIA_TRI", length = 100, nullable = false)
    private String giaTri;
}
