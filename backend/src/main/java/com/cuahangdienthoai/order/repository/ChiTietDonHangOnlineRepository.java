package com.cuahangdienthoai.order.repository;

import com.cuahangdienthoai.order.entity.ChiTietDonHangOnline;
import com.cuahangdienthoai.order.entity.ChiTietDonHangOnlineId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietDonHangOnlineRepository extends JpaRepository<ChiTietDonHangOnline, ChiTietDonHangOnlineId> {
    List<ChiTietDonHangOnline> findByMaDH(String maDH);
}
