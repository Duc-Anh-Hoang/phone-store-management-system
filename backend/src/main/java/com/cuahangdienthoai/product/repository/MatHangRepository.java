package com.cuahangdienthoai.product.repository;

import com.cuahangdienthoai.product.entity.MatHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatHangRepository extends JpaRepository<MatHang, String> {
    List<MatHang> findByNhomHangMaNhom(String maNhom);
    List<MatHang> findByLoaiHangMaLoai(String maLoai);

    @Query(value = "SELECT MAHANG as maHang, TONKHO as tonKho FROM dbo.vw_TonKho", nativeQuery = true)
    List<TonKhoProjection> findAllTonKho();
}
