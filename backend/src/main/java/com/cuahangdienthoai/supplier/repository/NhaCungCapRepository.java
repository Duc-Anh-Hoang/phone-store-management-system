package com.cuahangdienthoai.supplier.repository;

import com.cuahangdienthoai.supplier.entity.NhaCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, String> {}
