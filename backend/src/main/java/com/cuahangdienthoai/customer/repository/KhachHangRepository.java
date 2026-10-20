package com.cuahangdienthoai.customer.repository;

import com.cuahangdienthoai.customer.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    Optional<KhachHang> findBySdt(String sdt);
    Optional<KhachHang> findByEmail(String email);

    @Query(value = "SELECT MAKH as maKH, DIEMTICHLUY as diemTichLuy, TONGCHITIEU as tongChiTieu, TONGHOAN as tongHoan FROM dbo.vw_KhachHangThanThiet", nativeQuery = true)
    List<KhachHangThanThietProjection> findAllDiemTichLuy();

    @Query(value = "SELECT MAKH as maKH, DIEMTICHLUY as diemTichLuy, TONGCHITIEU as tongChiTieu, TONGHOAN as tongHoan FROM dbo.vw_KhachHangThanThiet WHERE MAKH = :maKH", nativeQuery = true)
    Optional<KhachHangThanThietProjection> findDiemTichLuyByMaKH(@Param("maKH") String maKH);
}
