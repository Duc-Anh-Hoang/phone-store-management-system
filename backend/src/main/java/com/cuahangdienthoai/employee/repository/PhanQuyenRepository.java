package com.cuahangdienthoai.employee.repository;

import com.cuahangdienthoai.employee.entity.PhanQuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhanQuyenRepository extends JpaRepository<PhanQuyen, String> {
}
