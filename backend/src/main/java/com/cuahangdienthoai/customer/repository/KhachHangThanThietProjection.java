package com.cuahangdienthoai.customer.repository;

import java.math.BigDecimal;

public interface KhachHangThanThietProjection {
    String getMaKH();
    Long getDiemTichLuy();
    BigDecimal getTongChiTieu();
    BigDecimal getTongHoan();
}
