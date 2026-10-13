package com.cuahangdienthoai.order.repository;

import com.cuahangdienthoai.order.entity.DonHangOnline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonHangOnlineRepository extends JpaRepository<DonHangOnline, String> {
    List<DonHangOnline> findByMaKH(String maKH);
    List<DonHangOnline> findByTrangThai(String trangThai);
    List<DonHangOnline> findBySdtNguoiNhanOrderByNgayDatDesc(String sdtNguoiNhan);
    List<DonHangOnline> findByTrangThaiOrderByNgayDatDesc(String trangThai);
}
