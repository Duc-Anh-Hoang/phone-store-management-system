package com.cuahangdienthoai.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "KhuyenMai")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KhuyenMai {
    @Id
    @Column(name = "MAKM", length = 10)
    private String maKM;

    @Column(name = "TENKM", length = 100, nullable = false)
    private String tenKM;

    @Column(name = "PHANTRAMGIAM", nullable = false, precision = 5, scale = 2)
    private BigDecimal phanTramGiam;

    @Column(name = "NGAYBD", nullable = false)
    private LocalDateTime ngayBD;

    @Column(name = "NGAYKT", nullable = false)
    private LocalDateTime ngayKT;

    @Column(name = "TAMDUNG", nullable = false)
    @Builder.Default
    private boolean tamDung = false;
}
