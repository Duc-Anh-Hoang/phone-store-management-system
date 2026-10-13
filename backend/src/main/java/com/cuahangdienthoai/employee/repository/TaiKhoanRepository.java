package com.cuahangdienthoai.employee.repository;

import com.cuahangdienthoai.employee.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {
    Optional<TaiKhoan> findByUsername(String username);
    boolean existsByNhanVienMaNV(String maNV);
}
