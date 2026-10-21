package com.cuahangdienthoai.common;

import com.cuahangdienthoai.customer.repository.KhachHangRepository;
import com.cuahangdienthoai.order.repository.DonHangOnlineRepository;
import com.cuahangdienthoai.order.repository.HoaDonRepository;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import com.cuahangdienthoai.supplier.repository.PhieuNhapRepository;
import com.cuahangdienthoai.warranty.repository.BaoHanhRepository;
import com.cuahangdienthoai.warranty.repository.PhieuTiepNhanBaoHanhRepository;
import com.cuahangdienthoai.warranty.repository.TraHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

@Component
@RequiredArgsConstructor
public class CodeGenerator {

    private final KhachHangRepository khachHangRepository;
    private final DonHangOnlineRepository donHangOnlineRepository;
    private final PhieuNhapRepository phieuNhapRepository;
    private final TraHangRepository traHangRepository;
    private final PhieuTiepNhanBaoHanhRepository phieuTiepNhanBaoHanhRepository;
    private final ImeiRepository imeiRepository;
    private final HoaDonRepository hoaDonRepository;
    private final BaoHanhRepository baoHanhRepository;

    /**
     * Thuật toán sinh mã kế tiếp từ mã lớn nhất hiện có:
     * - Tách phần số sau tiền tố
     * - +1
     * - Đệm số 0 theo độ dài (width)
     */
    public String generateNextCode(String maxCode, String prefix, int defaultWidth) {
        if (maxCode == null || !maxCode.startsWith(prefix)) {
            return String.format("%s%0" + defaultWidth + "d", prefix, 1);
        }

        String numPart = maxCode.substring(prefix.length()).trim();
        StringBuilder digits = new StringBuilder();
        for (char c : numPart.toCharArray()) {
            if (Character.isDigit(c)) {
                digits.append(c);
            } else {
                break;
            }
        }

        if (digits.length() == 0) {
            return String.format("%s%0" + defaultWidth + "d", prefix, 1);
        }

        long currentNum;
        try {
            currentNum = Long.parseLong(digits.toString());
        } catch (NumberFormatException e) {
            currentNum = 0;
        }

        long nextNum = currentNum + 1;
        int width = Math.max(defaultWidth, digits.length());
        return String.format("%s%0" + width + "d", prefix, nextNum);
    }

    public synchronized String generateNextMaKH() {
        String max = khachHangRepository.findTopByOrderByMaKHDesc()
                .map(k -> k.getMaKH()).orElse(null);
        return generateNextCode(max, "KH", 4);
    }

    public synchronized String generateNextMaDH() {
        String max = donHangOnlineRepository.findTopByOrderByMaDHDesc()
                .map(d -> d.getMaDH()).orElse(null);
        return generateNextCode(max, "DH", 6);
    }

    public synchronized String generateNextSoPN() {
        String max = phieuNhapRepository.findTopByOrderBySoPNhapDesc()
                .map(p -> p.getSoPNhap()).orElse(null);
        return generateNextCode(max, "PN", 3);
    }

    public synchronized String generateNextMaTR() {
        String max = traHangRepository.findTopByOrderByMaTRDesc()
                .map(t -> t.getMaTR()).orElse(null);
        return generateNextCode(max, "TR", 5);
    }

    public synchronized String generateNextMaTN() {
        String max = phieuTiepNhanBaoHanhRepository.findTopByOrderByMaTNDesc()
                .map(t -> t.getMaTN()).orElse(null);
        return generateNextCode(max, "TN", 5);
    }

    public synchronized String generateNextMaIMEI() {
        String max = imeiRepository.findTopByOrderByMaIMEIDesc()
                .map(i -> i.getMaIMEI()).orElse(null);
        return generateNextCode(max, "IMEI", 3);
    }

    public synchronized String generateNextSoHD() {
        String max = hoaDonRepository.findTopByOrderBySoHDDesc()
                .map(h -> h.getSoHD()).orElse(null);
        return generateNextCode(max, "HD", 6);
    }

    public synchronized String generateNextMaBH() {
        String max = baoHanhRepository.findTopByOrderByMaBHDesc()
                .map(b -> b.getMaBH()).orElse(null);
        return generateNextCode(max, "BH", 6);
    }

    /**
     * Cơ chế retry tối đa 3 lần nếu có xung đột trùng khóa
     */
    public <T> T executeWithRetry(Supplier<T> action) {
        int attempts = 0;
        while (true) {
            try {
                attempts++;
                return action.get();
            } catch (Exception ex) {
                if (attempts >= 3) {
                    throw ex;
                }
            }
        }
    }
}
