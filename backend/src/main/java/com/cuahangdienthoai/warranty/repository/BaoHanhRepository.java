package com.cuahangdienthoai.warranty.repository;

import com.cuahangdienthoai.warranty.entity.BaoHanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaoHanhRepository extends JpaRepository<BaoHanh, String> {
    Optional<BaoHanh> findByImeiMaIMEI(String maIMEI);
    Optional<BaoHanh> findByImeiSoIMEI(String soIMEI);
    List<BaoHanh> findByHoaDonSoHD(String soHD);
    Optional<BaoHanh> findTopByOrderByMaBHDesc();

    @Query(value = "SELECT MABH as maBH, SOHD as soHD, MAIMEI as maIMEI, SOIMEI as soIMEI, MAHANG as maHang, TENHANG as tenHang, MAKH as maKH, TENKH as tenKH, NGAYBD as ngayBD, THOIHANTHANG as thoiHanThang, NGAYKT as ngayKT, DIEUKIEN as dieuKien, TRANGTHAI as trangThai, SONGAYCONLAI as soNgayConLai FROM dbo.vw_BaoHanhTrangThai WHERE MAIMEI = :query OR SOIMEI = :query", nativeQuery = true)
    Optional<BaoHanhTrangThaiProjection> findTrangThaiByImeiOrSoImei(@Param("query") String query);
}
