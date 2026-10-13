package com.cuahangdienthoai.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietDonHangOnline")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ChiTietDonHangOnlineId.class)
public class ChiTietDonHangOnline {

    @Id
    @Column(name = "MADH", length = 15)
    private String maDH;

    @Id
    @Column(name = "MAHANG", length = 10)
    private String maHang;

    @Column(name = "SOLUONG", nullable = false)
    private Integer soLuong;

    @Column(name = "DONGIA", precision = 18, scale = 2, nullable = false)
    private BigDecimal donGia;
}
