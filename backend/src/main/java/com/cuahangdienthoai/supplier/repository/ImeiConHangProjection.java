package com.cuahangdienthoai.supplier.repository;

import java.time.LocalDateTime;

public interface ImeiConHangProjection {
    String getMaIMEI();
    String getSoIMEI();
    String getMaHang();
    String getTenHang();
    String getSoPn();
    LocalDateTime getNgayNhap();
}
