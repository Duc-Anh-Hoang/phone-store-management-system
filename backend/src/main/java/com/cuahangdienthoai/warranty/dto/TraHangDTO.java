package com.cuahangdienthoai.warranty.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TraHangDTO {
    private String maTR;
    private String soHD;
    private String maIMEI;
    private String soIMEI;
    private String maHang;
    private String tenHang;
    private String ngayTR;
    private String lyDo;
    private String hinhThucHoanTien;
    private String maNV;
    private String tenNhanVien;
}
