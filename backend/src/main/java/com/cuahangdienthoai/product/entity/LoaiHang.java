package com.cuahangdienthoai.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "LoaiHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoaiHang {
    @Id
    @Column(name = "MALOAI", length = 10)
    private String maLoai;

    @Column(name = "TENLOAI", length = 50, nullable = false, unique = true)
    private String tenLoai;
}
