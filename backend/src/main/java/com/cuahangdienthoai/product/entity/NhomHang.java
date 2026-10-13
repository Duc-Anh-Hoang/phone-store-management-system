package com.cuahangdienthoai.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NhomHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NhomHang {
    @Id
    @Column(name = "MANHOM", length = 10)
    private String maNhom;

    @Column(name = "TENNHOM", length = 50, nullable = false, unique = true)
    private String tenNhom;
}
