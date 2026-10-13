package com.cuahangdienthoai.order.service.impl;

import com.cuahangdienthoai.order.dto.OrderRequestDTO;
import com.cuahangdienthoai.order.dto.OrderResponseDTO;
import com.cuahangdienthoai.order.entity.DonHangOnline;
import com.cuahangdienthoai.order.entity.ChiTietDonHangOnline;
import com.cuahangdienthoai.order.repository.DonHangOnlineRepository;
import com.cuahangdienthoai.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final DonHangOnlineRepository orderRepository;
    private final com.cuahangdienthoai.order.repository.ChiTietDonHangOnlineRepository chiTietRepository;

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        // Sinh mã đơn hàng dạng: DH + timestamp ngẫu nhiên
        String maDH = "DH" + (System.currentTimeMillis() % 100000000);

        // Tính tổng tiền đơn hàng
        BigDecimal tongTien = BigDecimal.ZERO;
        if (request.getItems() != null) {
            for (OrderRequestDTO.OrderItemDTO item : request.getItems()) {
                BigDecimal subTotal = item.getDonGia().multiply(BigDecimal.valueOf(item.getSoLuong()));
                tongTien = tongTien.add(subTotal);
            }
        }

        // Tạo đơn hàng online
        DonHangOnline order = DonHangOnline.builder()
                .maDH(maDH)
                .maKH(request.getMaKH() != null ? request.getMaKH() : "KH001")
                .tenNguoiNhan(request.getTenNguoiNhan())
                .sdtNguoiNhan(request.getSdtNguoiNhan())
                .diaChiGiao(request.getDiaChiGiao())
                .phuongThucThanhToan(request.getPhuongThucThanhToan())
                .tongTien(tongTien)
                .trangThai("cho_xac_nhan")
                .ngayDat(LocalDateTime.now())
                .build();

        DonHangOnline savedOrder = orderRepository.save(order);

        // Lưu chi tiết đơn hàng
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderRequestDTO.OrderItemDTO item : request.getItems()) {
                ChiTietDonHangOnline detail = ChiTietDonHangOnline.builder()
                        .maDH(savedOrder.getMaDH())
                        .maHang(item.getMaHang())
                        .soLuong(item.getSoLuong())
                        .donGia(item.getDonGia())
                        .build();
                chiTietRepository.save(detail);
            }
        }

        return OrderResponseDTO.builder()
                .maDH(savedOrder.getMaDH())
                .tenNguoiNhan(savedOrder.getTenNguoiNhan())
                .sdtNguoiNhan(savedOrder.getSdtNguoiNhan())
                .diaChiGiao(savedOrder.getDiaChiGiao())
                .phuongThucThanhToan(savedOrder.getPhuongThucThanhToan())
                .tongTien(savedOrder.getTongTien())
                .trangThai(savedOrder.getTrangThai())
                .ngayDat(savedOrder.getNgayDat())
                .thongBao("Đặt hàng thành công! Đơn hàng đang được chờ xác nhận.")
                .build();
    }

    @Override
    public OrderResponseDTO getOrderById(String maDH) {
        DonHangOnline order = orderRepository.findById(maDH)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + maDH));

        return OrderResponseDTO.builder()
                .maDH(order.getMaDH())
                .tenNguoiNhan(order.getTenNguoiNhan())
                .sdtNguoiNhan(order.getSdtNguoiNhan())
                .diaChiGiao(order.getDiaChiGiao())
                .phuongThucThanhToan(order.getPhuongThucThanhToan())
                .tongTien(order.getTongTien())
                .trangThai(order.getTrangThai())
                .ngayDat(order.getNgayDat())
                .build();
    }

    @Override
    public List<OrderResponseDTO> getOrdersByPhone(String sdt) {
        return orderRepository.findBySdtNguoiNhanOrderByNgayDatDesc(sdt).stream()
                .map(order -> OrderResponseDTO.builder()
                        .maDH(order.getMaDH())
                        .tenNguoiNhan(order.getTenNguoiNhan())
                        .sdtNguoiNhan(order.getSdtNguoiNhan())
                        .diaChiGiao(order.getDiaChiGiao())
                        .phuongThucThanhToan(order.getPhuongThucThanhToan())
                        .tongTien(order.getTongTien())
                        .trangThai(order.getTrangThai())
                        .ngayDat(order.getNgayDat())
                        .build())
                .collect(Collectors.toList());
    }
}
