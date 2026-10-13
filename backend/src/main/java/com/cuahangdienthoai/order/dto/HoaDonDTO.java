package com.cuahangdienthoai.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoaDonDTO {
    private String soHD;
    private String ngayLap;
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
    private String phuongThucThanhToan;
    private List<ChiTietHoaDonDTO> chiTiet;
}
