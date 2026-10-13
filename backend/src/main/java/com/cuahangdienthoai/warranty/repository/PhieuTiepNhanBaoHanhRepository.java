package com.cuahangdienthoai.warranty.repository;

import com.cuahangdienthoai.warranty.entity.PhieuTiepNhanBaoHanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuTiepNhanBaoHanhRepository extends JpaRepository<PhieuTiepNhanBaoHanh, String> {
    List<PhieuTiepNhanBaoHanh> findByTrangThai(String trangThai);
    List<PhieuTiepNhanBaoHanh> findByNhanVienKyThuatMaNV(String maNV);
}
