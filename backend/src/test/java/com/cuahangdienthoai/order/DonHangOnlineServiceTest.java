package com.cuahangdienthoai.order;

import com.cuahangdienthoai.common.security.CurrentUser;
import com.cuahangdienthoai.order.dto.DonHangOnlineDTO;
import com.cuahangdienthoai.order.entity.DonHangOnline;
import com.cuahangdienthoai.order.entity.HoaDon;
import com.cuahangdienthoai.order.repository.DonHangOnlineRepository;
import com.cuahangdienthoai.order.repository.HoaDonRepository;
import com.cuahangdienthoai.order.service.DonHangOnlineService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonHangOnlineServiceTest {

    @Mock
    private DonHangOnlineRepository donHangOnlineRepository;

    @Mock
    private HoaDonRepository hoaDonRepository;

    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private DonHangOnlineService donHangOnlineService;

    @Test
    @DisplayName("3.2: Chuyển trạng thái hợp lệ: cho_xac_nhan -> da_xac_nhan")
    void testValidTransition() {
        DonHangOnline order = DonHangOnline.builder()
                .maDH("DH000001")
                .trangThai("cho_xac_nhan")
                .build();

        when(donHangOnlineRepository.findById("DH000001")).thenReturn(Optional.of(order));
        when(donHangOnlineRepository.save(any(DonHangOnline.class))).thenAnswer(i -> i.getArgument(0));

        DonHangOnlineDTO dto = donHangOnlineService.updateTrangThai("DH000001", "da_xac_nhan", "NV001", null);
        assertEquals("da_xac_nhan", dto.getTrangThai());
    }

    @Test
    @DisplayName("3.2: Chuyển trạng thái không hợp lệ: cho_xac_nhan -> hoan_thanh -> lỗi")
    void testInvalidTransitionThrows() {
        DonHangOnline order = DonHangOnline.builder()
                .maDH("DH000001")
                .trangThai("cho_xac_nhan")
                .build();

        when(donHangOnlineRepository.findById("DH000001")).thenReturn(Optional.of(order));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                donHangOnlineService.updateTrangThai("DH000001", "hoan_thanh", "NV001", null)
        );
        assertTrue(ex.getMessage().contains("Không thể chuyển đơn hàng từ trạng thái"));
    }

    @Test
    @DisplayName("3.2: hoan_thanh không có hóa đơn online -> lỗi")
    void testCompleteOrderWithoutOnlineInvoiceThrows() {
        DonHangOnline order = DonHangOnline.builder()
                .maDH("DH000001")
                .trangThai("dang_giao")
                .build();

        when(donHangOnlineRepository.findById("DH000001")).thenReturn(Optional.of(order));

        // Hóa đơn không có kênh online (ví dụ kênh tai_quay)
        HoaDon hdTaiQuay = HoaDon.builder()
                .soHD("HD0001")
                .kenhBan("tai_quay")
                .build();
        when(hoaDonRepository.findById("HD0001")).thenReturn(Optional.of(hdTaiQuay));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                donHangOnlineService.updateTrangThai("DH000001", "hoan_thanh", "NV001", "HD0001")
        );
        assertTrue(ex.getMessage().contains("KENHBAN='online'"));
    }
}
