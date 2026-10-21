package com.cuahangdienthoai.supplier.repository;

import com.cuahangdienthoai.supplier.entity.Imei;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImeiRepository extends JpaRepository<Imei, String> {
    List<Imei> findByTrangThai(String trangThai);
    Optional<Imei> findBySoIMEI(String soIMEI);
    List<Imei> findByChiTietPhieuNhapMatHangMaHang(String maHang);
    Optional<Imei> findTopByOrderByMaIMEIDesc();

    @Query(value = "SELECT MAIMEI as maIMEI, SOIMEI as soIMEI, MAHANG as maHang, TENHANG as tenHang, SOPN as soPn, NGAYNHAP as ngayNhap FROM dbo.vw_IMEIConHang WHERE MAHANG = :maHang", nativeQuery = true)
    List<ImeiConHangProjection> findAvailableByMaHang(@Param("maHang") String maHang);
}
