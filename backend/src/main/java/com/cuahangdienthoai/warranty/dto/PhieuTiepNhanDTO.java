package com.cuahangdienthoai.warranty.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhieuTiepNhanDTO {
    private String maTN;
    private String maBH;
    private String maIMEI;
    private String soIMEI;
    private String ngayNhan;
    private String tinhTrangLoi;
    private String maNVTiepNhan;
    private String tenNVTiepNhan;
    private String maNVKyThuat;
    private String tenNVKyThuat;
    private String ngayHenTra;
    private String ngayTra;
    private String ketQua;
    private BigDecimal chiPhi;
    private String trangThai;
}
