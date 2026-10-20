package com.cuahangdienthoai.customer.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KhachHangDTO {
    private String maKH;
    private String hoTen;
    private String diaChi;
    private String sdt;
    private String email;
    private Long diemTichLuy;
    private BigDecimal tongChiTieu;
}
