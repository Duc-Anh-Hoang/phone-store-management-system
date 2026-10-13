package com.cuahangdienthoai.warranty.repository;

import com.cuahangdienthoai.warranty.entity.BaoHanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaoHanhRepository extends JpaRepository<BaoHanh, String> {
    Optional<BaoHanh> findByImeiMaIMEI(String maIMEI);
    List<BaoHanh> findByHoaDonSoHD(String soHD);
}
