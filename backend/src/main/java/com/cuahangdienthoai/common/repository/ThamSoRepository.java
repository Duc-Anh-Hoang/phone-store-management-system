package com.cuahangdienthoai.common.repository;

import com.cuahangdienthoai.common.entity.ThamSo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThamSoRepository extends JpaRepository<ThamSo, String> {
}
