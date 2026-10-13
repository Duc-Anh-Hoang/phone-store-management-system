package com.cuahangdienthoai.employee.repository;

import com.cuahangdienthoai.employee.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    List<NhanVien> findByTrangThai(String trangThai);
    Optional<NhanVien> findByEmail(String email);
    List<NhanVien> findByChucVu(String chucVu);
}
