package com.cuahangdienthoai.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ThuocTinh")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThuocTinh {
    @Id
    @Column(name = "MATHUOCTINH", length = 10)
    private String maThuocTinh;

    @Column(name = "TENTHUOCTINH", length = 50, nullable = false)
    private String tenThuocTinh;
}
