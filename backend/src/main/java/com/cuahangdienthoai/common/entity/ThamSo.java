package com.cuahangdienthoai.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ThamSo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThamSo {
    @Id
    @Column(name = "MATHAMSO", length = 30)
    private String maThamSo;

    @Column(name = "TENTHAMSO", length = 100, nullable = false)
    private String tenThamSo;

    @Column(name = "GIATRI", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaTri;

    @Column(name = "DONVI", length = 20)
    private String donVi;
}
