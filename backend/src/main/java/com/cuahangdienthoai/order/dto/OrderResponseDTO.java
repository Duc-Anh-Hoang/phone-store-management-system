package com.cuahangdienthoai.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {
    private String maDH;
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private String diaChiGiao;
    private String phuongThucThanhToan;
    private BigDecimal tongTien;
    private String trangThai;
    private LocalDateTime ngayDat;
    private String thongBao;
}
