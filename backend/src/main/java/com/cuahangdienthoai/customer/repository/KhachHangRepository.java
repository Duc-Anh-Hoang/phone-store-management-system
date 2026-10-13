package com.cuahangdienthoai.customer.repository;

import com.cuahangdienthoai.customer.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    Optional<KhachHang> findBySdt(String sdt);
    Optional<KhachHang> findByEmail(String email);
}
