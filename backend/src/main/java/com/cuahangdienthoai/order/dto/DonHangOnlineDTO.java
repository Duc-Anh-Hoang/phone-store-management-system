package com.cuahangdienthoai.order.dto;

import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DonHangOnlineDTO {
    private String maDH;
    private String ngayDat;
    private String maKH;
    private String tenNguoiNhan;

    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại phải đúng 10 chữ số bắt đầu bằng 0")
    private String sdtNguoiNhan;

    private String diaChiGiao;
    private String phuongThucThanhToan;
    private BigDecimal tongTien;
    private String trangThai;
    private String maNV;
    private String soHD;
}
