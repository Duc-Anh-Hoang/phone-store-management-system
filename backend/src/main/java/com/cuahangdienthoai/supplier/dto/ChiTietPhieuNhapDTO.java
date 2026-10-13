package com.cuahangdienthoai.supplier.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietPhieuNhapDTO {
    private String soPNhap;
    private String maHang;
    private String tenHang;
    private int slNhap;
    private BigDecimal donGiaNhap;
}
