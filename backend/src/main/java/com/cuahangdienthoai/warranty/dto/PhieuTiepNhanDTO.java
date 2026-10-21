package com.cuahangdienthoai.warranty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhieuTiepNhanDTO {
    private String maTN;
    private String maBH;
    private String maIMEI;
    
    @NotBlank(message = "Số IMEI không được để trống")
    @Pattern(regexp = "^[0-9]{15}$", message = "Số IMEI phải đúng 15 chữ số")
    private String soIMEI;
    
    private String ngayNhan;
    
    @NotBlank(message = "Tình trạng lỗi không được để trống")
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
