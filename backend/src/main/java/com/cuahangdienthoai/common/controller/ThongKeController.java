package com.cuahangdienthoai.common.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thongke")
@RequiredArgsConstructor
public class ThongKeController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/doanhthu")
    public ResponseEntity<List<Map<String, Object>>> getDoanhThu(
            @RequestParam(required = false) String tu,
            @RequestParam(required = false) String den) {
        String sql = "SELECT NAM, THANG, KENHBAN, SOHOADON, TONGTIEN, TIENGIAMGIA, DOANHTHU FROM dbo.vw_DoanhThuThang ORDER BY NAM DESC, THANG DESC";
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/tonghop")
    public ResponseEntity<Map<String, Object>> getTongHop() {
        Long tongHoaDon = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.HoaDon", Long.class);
        BigDecimal tongDoanhThu = jdbcTemplate.queryForObject("SELECT ISNULL(SUM(THANHTIEN), 0) FROM dbo.HoaDon", BigDecimal.class);
        Long tongKhachHang = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.KhachHang", Long.class);
        Long tongMatHang = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.MatHang", Long.class);
        Long tongDonOnline = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.DonHangOnline", Long.class);

        Map<String, Object> result = Map.of(
                "tongHoaDon", tongHoaDon != null ? tongHoaDon : 0L,
                "tongDoanhThu", tongDoanhThu != null ? tongDoanhThu : BigDecimal.ZERO,
                "tongKhachHang", tongKhachHang != null ? tongKhachHang : 0L,
                "tongMatHang", tongMatHang != null ? tongMatHang : 0L,
                "tongDonOnline", tongDonOnline != null ? tongDonOnline : 0L
        );
        return ResponseEntity.ok(result);
    }
}
