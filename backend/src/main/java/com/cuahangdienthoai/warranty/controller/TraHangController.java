package com.cuahangdienthoai.warranty.controller;

import com.cuahangdienthoai.warranty.dto.TraHangDTO;
import com.cuahangdienthoai.warranty.service.TraHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trahang")
@RequiredArgsConstructor
public class TraHangController {

    private final TraHangService traHangService;
    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<TraHangDTO> getAll() {
        return traHangService.getAll();
    }

    @GetMapping("/tracuu")
    public ResponseEntity<?> traCuuImei(@RequestParam(name = "soIMEI") String soIMEI) {
        if (soIMEI == null || soIMEI.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số IMEI không được để trống"));
        }
        String sql = "SELECT TOP 1 i.SOIMEI, i.MAIMEI, m.MAHANG, m.TENHANG, h.SOHD, h.NGAYLAP as NGAYMUA, " +
                     "ISNULL(ct.DONGIA_BAN, m.DONGIA) as DONGIABAN, ISNULL(ct.DONGIA_BAN, m.DONGIA) as SOTIENTHUCTRA " +
                     "FROM dbo.IMEI i " +
                     "JOIN dbo.MatHang m ON m.MAHANG = i.MAHANG " +
                     "LEFT JOIN dbo.ChiTietHoaDon ct ON ct.MAIMEI = i.MAIMEI " +
                     "LEFT JOIN dbo.HoaDon h ON h.SOHD = ct.SOHD " +
                     "WHERE i.SOIMEI = ? OR i.MAIMEI = ? " +
                     "ORDER BY h.NGAYLAP DESC";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, soIMEI, soIMEI);
        if (rows.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy IMEI trên hệ thống: " + soIMEI));
        }
        Map<String, Object> row = rows.get(0);
        Map<String, Object> result = new HashMap<>();
        result.put("soIMEI", row.get("SOIMEI"));
        result.put("maIMEI", row.get("MAIMEI"));
        result.put("maHang", row.get("MAHANG"));
        result.put("tenHang", row.get("TENHANG"));
        result.put("soHD", row.get("SOHD"));
        Object ngayMuaObj = row.get("NGAYMUA");
        result.put("ngayMua", ngayMuaObj != null ? ngayMuaObj.toString() : null);
        result.put("donGiaBan", row.get("DONGIABAN") != null ? row.get("DONGIABAN") : 0);
        result.put("soTienThucTra", row.get("SOTIENTHUCTRA") != null ? row.get("SOTIENTHUCTRA") : 0);

        boolean conHanDoiTra = false;
        if (ngayMuaObj instanceof java.sql.Timestamp) {
            java.time.LocalDateTime ngayMua = ((java.sql.Timestamp) ngayMuaObj).toLocalDateTime();
            long days = java.time.temporal.ChronoUnit.DAYS.between(ngayMua, java.time.LocalDateTime.now());
            conHanDoiTra = days <= 30;
        } else if (ngayMuaObj != null) {
            conHanDoiTra = true;
        }
        result.put("conHanDoiTra", conHanDoiTra);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{maTR}")
    public TraHangDTO getById(@PathVariable String maTR) {
        return traHangService.getById(maTR);
    }

    @GetMapping("/hoadon/{soHD}")
    public List<TraHangDTO> getByHoaDon(@PathVariable String soHD) {
        return traHangService.getByHoaDon(soHD);
    }

    @PostMapping
    public TraHangDTO create(@RequestBody TraHangDTO dto) {
        return traHangService.create(dto);
    }

    @DeleteMapping("/{maTR}")
    public ResponseEntity<Void> delete(@PathVariable String maTR) {
        traHangService.delete(maTR);
        return ResponseEntity.noContent().build();
    }
}

