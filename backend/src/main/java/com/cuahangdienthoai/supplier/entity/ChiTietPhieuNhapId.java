package com.cuahangdienthoai.supplier.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class ChiTietPhieuNhapId implements Serializable {
    @Column(name = "SOPN", length = 15)
    private String soPNhap;

    @Column(name = "MAHANG", length = 10)
    private String maHang;
}
