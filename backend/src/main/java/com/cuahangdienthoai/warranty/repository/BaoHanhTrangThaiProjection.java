package com.cuahangdienthoai.warranty.repository;

import java.time.LocalDateTime;

public interface BaoHanhTrangThaiProjection {
    String getMaBH();
    String getSoHD();
    String getMaIMEI();
    String getSoIMEI();
    String getMaHang();
    String getTenHang();
    String getMaKH();
    String getTenKH();
    LocalDateTime getNgayBD();
    Integer getThoiHanThang();
    LocalDateTime getNgayKT();
    String getDieuKien();
    String getTrangThai();
    Integer getSoNgayConLai();
}
