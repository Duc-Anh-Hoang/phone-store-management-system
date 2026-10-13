package com.cuahangdienthoai.product.repository;

import com.cuahangdienthoai.product.entity.ThuocTinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThuocTinhRepository extends JpaRepository<ThuocTinh, String> {}
