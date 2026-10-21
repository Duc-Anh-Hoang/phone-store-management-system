package com.cuahangdienthoai.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietHoaDonDTO {
    private Integer maCTHD;
    private String soHD;
    
    @NotBlank(message = "Mã hàng không được để trống")
    private String maHang;
    
    private String tenHang;
    private String maIMEI;
    private String soIMEI;
    
    @Min(value = 1, message = "Số lượng bán phải lớn hơn 0")
    private int slBan;
    
    private BigDecimal donGiaBan;
    private BigDecimal thanhTien;
}
