package com.cuahangdienthoai.order.repository;

import com.cuahangdienthoai.order.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {
    List<HoaDon> findByKhachHangMaKH(String maKH);
    List<HoaDon> findByNhanVienMaNV(String maNV);
    List<HoaDon> findByNgayLapBetween(LocalDateTime from, LocalDateTime to);
    List<HoaDon> findByKenhBan(String kenhBan);
}
