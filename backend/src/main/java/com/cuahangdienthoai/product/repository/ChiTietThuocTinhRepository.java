package com.cuahangdienthoai.product.repository;

import com.cuahangdienthoai.product.entity.ChiTietThuocTinh;
import com.cuahangdienthoai.product.entity.ChiTietThuocTinhId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietThuocTinhRepository extends JpaRepository<ChiTietThuocTinh, ChiTietThuocTinhId> {
    List<ChiTietThuocTinh> findByIdMaHang(String maHang);
    List<ChiTietThuocTinh> findByIdMaThuocTinh(String maThuocTinh);
}
