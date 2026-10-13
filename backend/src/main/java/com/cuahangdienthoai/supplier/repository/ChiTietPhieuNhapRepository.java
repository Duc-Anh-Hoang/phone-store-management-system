package com.cuahangdienthoai.supplier.repository;

import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhap;
import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhapId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietPhieuNhapRepository extends JpaRepository<ChiTietPhieuNhap, ChiTietPhieuNhapId> {
    List<ChiTietPhieuNhap> findByIdSoPNhap(String soPNhap);
    List<ChiTietPhieuNhap> findByIdMaHang(String maHang);
}
