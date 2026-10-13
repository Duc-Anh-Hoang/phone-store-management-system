package com.cuahangdienthoai.product.repository;

import com.cuahangdienthoai.product.entity.LoaiHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoaiHangRepository extends JpaRepository<LoaiHang, String> {}
