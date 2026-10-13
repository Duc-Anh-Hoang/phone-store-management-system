package com.cuahangdienthoai.order.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DonHangOnlineDTO {
    private String maDH;
    private String ngayDat;
    private String maKH;
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private String diaChiGiao;
    private String phuongThucThanhToan;
    private BigDecimal tongTien;
    private String trangThai;
    private String maNV;
    private String soHD;
}
