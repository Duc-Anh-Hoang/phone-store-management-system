package com.cuahangdienthoai.product.repository;

import com.cuahangdienthoai.product.entity.NhomHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NhomHangRepository extends JpaRepository<NhomHang, String> {}
