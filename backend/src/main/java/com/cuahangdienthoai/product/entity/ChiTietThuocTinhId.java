package com.cuahangdienthoai.product.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class ChiTietThuocTinhId implements Serializable {
    @Column(name = "MAHANG", length = 10)
    private String maHang;

    @Column(name = "MATHUOCTINH", length = 10)
    private String maThuocTinh;
}
