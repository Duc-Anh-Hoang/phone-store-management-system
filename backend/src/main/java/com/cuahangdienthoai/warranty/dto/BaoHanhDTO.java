package com.cuahangdienthoai.warranty.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BaoHanhDTO {
    private String maBH;
    private String soHD;
    private String maIMEI;
    private String soIMEI;
    private String maHang;
    private String tenHang;
    private String ngayBD;
    private String ngayKT;
    private int thoiHanThang;
    private String dieuKien;
}
