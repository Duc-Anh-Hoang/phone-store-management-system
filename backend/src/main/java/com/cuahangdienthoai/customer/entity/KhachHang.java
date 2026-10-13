package com.cuahangdienthoai.customer.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "KhachHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHang {

    @Id
    @Column(name = "MAKH", length = 10)
    private String maKH;

    @Column(name = "HOTEN", length = 100, nullable = false)
    private String hoTen;

    @Column(name = "DIACHI", length = 255)
    private String diaChi;

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "EMAIL", length = 100)
    private String email;
}
