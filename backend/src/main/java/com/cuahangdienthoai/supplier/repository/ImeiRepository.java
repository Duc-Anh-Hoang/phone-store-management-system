package com.cuahangdienthoai.supplier.repository;

import com.cuahangdienthoai.supplier.entity.Imei;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImeiRepository extends JpaRepository<Imei, String> {
    List<Imei> findByTrangThai(String trangThai);
    Optional<Imei> findBySoIMEI(String soIMEI);
    List<Imei> findByChiTietPhieuNhapMatHangMaHang(String maHang);
}
