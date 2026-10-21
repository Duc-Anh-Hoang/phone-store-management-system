package com.cuahangdienthoai.common.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
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

    @GetMapping("/kenhban")
    public ResponseEntity<List<Map<String, Object>>> getDoanhThuKenhBan() {
        String sql = "SELECT ISNULL(h.KENHBAN, 'khac') AS KENHBAN, COUNT(*) AS SOHOADON, " +
                     "ISNULL(SUM(h.TONGTIEN), 0) AS TONGTIEN, ISNULL(SUM(h.TIENGIAMGIA), 0) AS TIENGIAMGIA, " +
                     "ISNULL(SUM(h.THANHTIEN), 0) AS DOANHTHU FROM dbo.HoaDon h GROUP BY h.KENHBAN";
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/nhomhang")
    public ResponseEntity<List<Map<String, Object>>> getDoanhThuNhomHang() {
        String sql = "SELECT ng.MANHOM, ng.TENNHOM, ISNULL(SUM(v.SLBAN), 0) AS SOLUONGBAN, " +
                     "ISNULL(SUM(v.THANHTIEN_DONG), 0) AS DOANHTHU " +
                     "FROM dbo.NhomHang ng " +
                     "LEFT JOIN dbo.vw_ChiTietBanHang v ON v.MANHOM = ng.MANHOM " +
                     "GROUP BY ng.MANHOM, ng.TENNHOM ORDER BY DOANHTHU DESC";
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

        Long donChoDuyet = 0L;
        try {
            donChoDuyet = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.DonHangOnline WHERE TRANGTHAI = 'cho_xac_nhan'", Long.class);
        } catch (Exception ignored) {}

        Long tongTonKho = 0L;
        try {
            tongTonKho = jdbcTemplate.queryForObject("SELECT ISNULL(SUM(TONKHO), 0) FROM dbo.vw_TonKho", Long.class);
        } catch (Exception ignored) {}

        Long mayBaoHanh = 0L;
        try {
            mayBaoHanh = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.PhieuTiepNhanBaoHanh WHERE TRANGTHAI = 'dang_sua'", Long.class);
        } catch (Exception ignored) {}

        Map<String, Object> result = new HashMap<>();
        result.put("tongHoaDon", tongHoaDon != null ? tongHoaDon : 0L);
        result.put("tongDoanhThu", tongDoanhThu != null ? tongDoanhThu : BigDecimal.ZERO);
        result.put("tongKhachHang", tongKhachHang != null ? tongKhachHang : 0L);
        result.put("tongMatHang", tongMatHang != null ? tongMatHang : 0L);
        result.put("tongDonOnline", tongDonOnline != null ? tongDonOnline : 0L);
        result.put("donChoDuyet", donChoDuyet != null ? donChoDuyet : 0L);
        result.put("tongTonKho", tongTonKho != null ? tongTonKho : 0L);
        result.put("mayBaoHanh", mayBaoHanh != null ? mayBaoHanh : 0L);

        return ResponseEntity.ok(result);
    }
}
