package com.cuahangdienthoai.order.repository;

import com.cuahangdienthoai.order.entity.KhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai, String> {
    List<KhuyenMai> findByTamDung(boolean tamDung);

    @Query("SELECT k FROM KhuyenMai k WHERE k.tamDung = false AND k.ngayBD <= CURRENT_TIMESTAMP AND k.ngayKT >= CURRENT_TIMESTAMP")
    List<KhuyenMai> findHoatDong();
}
