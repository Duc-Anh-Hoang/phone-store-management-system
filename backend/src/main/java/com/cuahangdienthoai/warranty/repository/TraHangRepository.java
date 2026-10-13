package com.cuahangdienthoai.warranty.repository;

import com.cuahangdienthoai.warranty.entity.TraHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TraHangRepository extends JpaRepository<TraHang, String> {
    List<TraHang> findByHoaDonSoHD(String soHD);
    Optional<TraHang> findByImeiMaIMEI(String maIMEI);
    List<TraHang> findByNhanVienMaNV(String maNV);
}
