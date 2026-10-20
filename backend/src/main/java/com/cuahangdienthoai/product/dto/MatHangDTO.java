package com.cuahangdienthoai.product.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MatHangDTO {
    private String maHang;
    private String tenHang;
    private BigDecimal donGia;
    private String dvt;
    private String maNhom;
    private String tenNhom;
    private String maLoai;
    private String tenLoai;
    private boolean quanLyIMEI;
    private int thoiHanBaoHanh;
    private Integer tonKho;
}
