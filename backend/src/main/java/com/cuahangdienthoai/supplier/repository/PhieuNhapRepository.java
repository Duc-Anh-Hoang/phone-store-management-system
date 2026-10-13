package com.cuahangdienthoai.supplier.repository;

import com.cuahangdienthoai.supplier.entity.PhieuNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuNhapRepository extends JpaRepository<PhieuNhap, String> {
    List<PhieuNhap> findByNhaCungCapMaNCC(String maNCC);
    List<PhieuNhap> findByNhanVienMaNV(String maNV);
}
