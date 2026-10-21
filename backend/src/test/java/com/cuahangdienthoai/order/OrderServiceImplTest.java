package com.cuahangdienthoai.order;

import com.cuahangdienthoai.customer.repository.KhachHangRepository;
import com.cuahangdienthoai.order.dto.OrderRequestDTO;
import com.cuahangdienthoai.order.dto.OrderResponseDTO;
import com.cuahangdienthoai.order.entity.DonHangOnline;
import com.cuahangdienthoai.order.repository.ChiTietDonHangOnlineRepository;
import com.cuahangdienthoai.order.repository.DonHangOnlineRepository;
import com.cuahangdienthoai.order.service.impl.OrderServiceImpl;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.product.repository.TonKhoProjection;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private DonHangOnlineRepository orderRepository;

    @Mock
    private ChiTietDonHangOnlineRepository chiTietRepository;

    @Mock
    private KhachHangRepository khachHangRepository;

    @Mock
    private MatHangRepository matHangRepository;

    @Mock
    private com.cuahangdienthoai.common.CodeGenerator codeGenerator;

    @InjectMocks
    private OrderServiceImpl orderService;

    private TonKhoProjection createTonKhoMock(String maHang, int tonKho) {
        return new TonKhoProjection() {
            @Override
            public String getMaHang() {
                return maHang;
            }

            @Override
            public Integer getTonKho() {
                return tonKho;
            }
        };
    }

    @Test
    @DisplayName("3.1: Hàng thiếu mã hàng -> báo lỗi 400")
    void testCreateOrderMissingMaHangThrows() {
        OrderRequestDTO request = OrderRequestDTO.builder()
                .tenNguoiNhan("Nguyễn Văn A")
                .sdtNguoiNhan("0987654321")
                .diaChiGiao("123 Lê Văn Việt")
                .phuongThucThanhToan("cod")
                .items(List.of(
                        OrderRequestDTO.OrderItemDTO.builder()
                                .maHang("") // Rỗng
                                .soLuong(1)
                                .donGia(BigDecimal.valueOf(1000000))
                                .build()
                ))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                orderService.createOrder(request)
        );
        assertTrue(ex.getMessage().contains("Thiếu mã hàng"));
    }

    @Test
    @DisplayName("3.1: Đặt vượt quá tồn kho từ vw_TonKho -> báo lỗi 400 kèm thông điệp tồn kho")
    void testCreateOrderExceedsStockThrows() {
        OrderRequestDTO request = OrderRequestDTO.builder()
                .tenNguoiNhan("Nguyễn Văn A")
                .sdtNguoiNhan("0987654321")
                .diaChiGiao("123 Lê Văn Việt")
                .phuongThucThanhToan("cod")
                .items(List.of(
                        OrderRequestDTO.OrderItemDTO.builder()
                                .maHang("MH001")
                                .soLuong(5)
                                .donGia(BigDecimal.valueOf(1000000))
                                .build()
                ))
                .build();

        // Tồn kho chỉ còn 2
        when(matHangRepository.findTonKhoByMaHang("MH001"))
                .thenReturn(Optional.of(createTonKhoMock("MH001", 2)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                orderService.createOrder(request)
        );
        assertTrue(ex.getMessage().contains("chỉ còn 2 sản phẩm"));
    }

    @Test
    @DisplayName("3.1: Giá sản phẩm luôn lấy từ MatHang.DONGIA trong DB dù client gửi giá khác")
    void testCreateOrderPriceFromDatabase() {
        OrderRequestDTO request = OrderRequestDTO.builder()
                .tenNguoiNhan("Nguyễn Văn A")
                .sdtNguoiNhan("0987654321")
                .diaChiGiao("123 Lê Văn Việt")
                .phuongThucThanhToan("cod")
                .items(List.of(
                        OrderRequestDTO.OrderItemDTO.builder()
                                .maHang("MH001")
                                .soLuong(2)
                                .donGia(BigDecimal.valueOf(100)) // Client cố tình gửi giá 100đ
                                .build()
                ))
                .build();

        // Tồn kho đủ 10 máy
        when(matHangRepository.findTonKhoByMaHang("MH001"))
                .thenReturn(Optional.of(createTonKhoMock("MH001", 10)));

        // Giá trong CSDL thực tế là 20.000.000đ
        MatHang matHangDb = MatHang.builder()
                .maHang("MH001")
                .tenHang("iPhone 16 Pro Max")
                .donGia(BigDecimal.valueOf(20000000))
                .build();
        when(matHangRepository.findById("MH001")).thenReturn(Optional.of(matHangDb));
        when(codeGenerator.generateNextMaKH()).thenReturn("KH0001");
        when(codeGenerator.generateNextMaDH()).thenReturn("DH000001");

        when(orderRepository.save(any(DonHangOnline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponseDTO response = orderService.createOrder(request);

        // Tổng tiền phải là 20.000.000 * 2 = 40.000.000đ, không phải 200đ
        assertEquals(0, BigDecimal.valueOf(40000000).compareTo(response.getTongTien()));
    }
}
