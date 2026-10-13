package com.cuahangdienthoai.order.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietHoaDonDTO {
    private Integer maCTHD;
    private String soHD;
    private String maHang;
    private String tenHang;
    private String maIMEI;
    private String soIMEI;
    private int slBan;
    private BigDecimal donGiaBan;
    private BigDecimal thanhTien;
}
