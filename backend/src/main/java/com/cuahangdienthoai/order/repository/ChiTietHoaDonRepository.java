package com.cuahangdienthoai.order.repository;

import com.cuahangdienthoai.order.entity.ChiTietHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, Integer> {
    List<ChiTietHoaDon> findByHoaDonSoHD(String soHD);
    List<ChiTietHoaDon> findByMatHangMaHang(String maHang);
    List<ChiTietHoaDon> findByImeiMaIMEI(String maIMEI);
}
