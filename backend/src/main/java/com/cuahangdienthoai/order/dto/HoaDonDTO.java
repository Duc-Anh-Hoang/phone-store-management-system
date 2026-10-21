package com.cuahangdienthoai.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoaDonDTO {
    private String soHD;
    private String ngayLap;
    
    @NotBlank(message = "Mã khách hàng không được để trống")
    private String maKH;
    
    private String tenKhachHang;
    private String maNV;
    private String tenNhanVien;
    private String maKM;
    private String tenKhuyenMai;
    private String kenhBan;
    private BigDecimal tongTien;
    private BigDecimal tienGiamGia;
    private BigDecimal thanhTien;
    
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    @Pattern(regexp = "^(tien_mat|chuyen_khoan|the)$", message = "Phương thức thanh toán phải là tien_mat, chuyen_khoan hoặc the")
    private String phuongThucThanhToan;
    
    @NotEmpty(message = "Chi tiết hóa đơn không được để trống")
    @Valid
    private List<ChiTietHoaDonDTO> chiTiet;
}
