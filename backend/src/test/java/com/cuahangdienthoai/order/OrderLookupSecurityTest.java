package com.cuahangdienthoai.order;

import com.cuahangdienthoai.order.dto.OrderResponseDTO;
import com.cuahangdienthoai.order.entity.DonHangOnline;
import com.cuahangdienthoai.order.repository.ChiTietDonHangOnlineRepository;
import com.cuahangdienthoai.order.repository.DonHangOnlineRepository;
import com.cuahangdienthoai.order.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderLookupSecurityTest {

    @Mock
    private DonHangOnlineRepository orderRepository;

    @Mock
    private ChiTietDonHangOnlineRepository chiTietRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    @DisplayName("Tra đơn theo mã kèm đúng SĐT -> trả về đơn hàng")
    void testGetOrderByIdAndPhoneSuccess() {
        DonHangOnline order = DonHangOnline.builder()
                .maDH("DH000001")
                .sdtNguoiNhan("0987654321")
                .tenNguoiNhan("Nguyễn Văn A")
                .diaChiGiao("123 Lê Văn Việt")
                .tongTien(BigDecimal.valueOf(10000000))
                .trangThai("cho_xac_nhan")
                .ngayDat(LocalDateTime.now())
                .build();

        when(orderRepository.findById("DH000001")).thenReturn(Optional.of(order));
        when(chiTietRepository.findByMaDH("DH000001")).thenReturn(Collections.emptyList());

        OrderResponseDTO result = orderService.getOrderByIdAndPhone("DH000001", "0987654321");
        assertNotNull(result);
        assertEquals("DH000001", result.getMaDH());
        assertEquals("0987654321", result.getSdtNguoiNhan());
    }

    @Test
    @DisplayName("Tra đơn theo mã nhưng sai SĐT -> 404 ResponseStatusException")
    void testGetOrderByIdAndPhoneWrongPhoneThrows404() {
        DonHangOnline order = DonHangOnline.builder()
                .maDH("DH000001")
                .sdtNguoiNhan("0987654321")
                .build();

        when(orderRepository.findById("DH000001")).thenReturn(Optional.of(order));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                orderService.getOrderByIdAndPhone("DH000001", "0911111111")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Tra đơn theo mã nhưng thiếu SĐT -> 404 ResponseStatusException")
    void testGetOrderByIdAndPhoneMissingPhoneThrows404() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                orderService.getOrderByIdAndPhone("DH000001", "")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Tra cứu danh sách theo SĐT trả về dữ liệu rút gọn: che giữa SĐT và ẩn địa chỉ đầy đủ")
    void testGetOrdersByPhoneRedacted() {
        DonHangOnline order = DonHangOnline.builder()
                .maDH("DH000001")
                .sdtNguoiNhan("0987654321")
                .tenNguoiNhan("Nguyễn Văn A")
                .diaChiGiao("123 Lê Văn Việt, Tăng Nhơn Phú, TP Thủ Đức")
                .tongTien(BigDecimal.valueOf(10000000))
                .trangThai("cho_xac_nhan")
                .ngayDat(LocalDateTime.now())
                .build();

        when(orderRepository.findBySdtNguoiNhanOrderByNgayDatDesc("0987654321"))
                .thenReturn(List.of(order));
        when(chiTietRepository.findByMaDH("DH000001")).thenReturn(Collections.emptyList());

        List<OrderResponseDTO> list = orderService.getOrdersByPhone("0987654321");
        assertEquals(1, list.size());
        OrderResponseDTO item = list.get(0);

        // Kiểm tra che giữa SĐT: 09xxxxx321
        assertEquals("09xxxxx321", item.getSdtNguoiNhan());
        // Kiểm tra không trả địa chỉ đầy đủ
        assertTrue(item.getDiaChiGiao().contains("***"));
    }
}
