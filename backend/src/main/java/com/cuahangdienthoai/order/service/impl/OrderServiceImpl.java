package com.cuahangdienthoai.order.service.impl;

import com.cuahangdienthoai.customer.entity.KhachHang;
import com.cuahangdienthoai.customer.repository.KhachHangRepository;
import com.cuahangdienthoai.order.dto.OrderRequestDTO;
import com.cuahangdienthoai.order.dto.OrderResponseDTO;
import com.cuahangdienthoai.order.entity.ChiTietDonHangOnline;
import com.cuahangdienthoai.order.entity.DonHangOnline;
import com.cuahangdienthoai.order.repository.ChiTietDonHangOnlineRepository;
import com.cuahangdienthoai.order.repository.DonHangOnlineRepository;
import com.cuahangdienthoai.order.service.OrderService;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final DonHangOnlineRepository orderRepository;
    private final ChiTietDonHangOnlineRepository chiTietRepository;
    private final KhachHangRepository khachHangRepository;
    private final MatHangRepository matHangRepository;

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        // Chuẩn hóa phương thức thanh toán: chỉ nhận cod, chuyen_khoan, the
        String pttt = "cod";
        if (request.getPhuongThucThanhToan() != null) {
            String lower = request.getPhuongThucThanhToan().toLowerCase();
            if (lower.contains("chuyen") || lower.contains("bank")) {
                pttt = "chuyen_khoan";
            } else if (lower.contains("the") || lower.contains("card")) {
                pttt = "the";
            } else {
                pttt = "cod";
            }
        }

        // Tìm hoặc tự động tạo khách hàng theo SĐT (không tin mã KH rỗng hoặc sai)
        String maKH = request.getMaKH();
        if (maKH != null && !maKH.trim().isEmpty() && !khachHangRepository.existsById(maKH)) {
            maKH = null;
        }

        if (maKH == null || maKH.trim().isEmpty()) {
            String sdt = request.getSdtNguoiNhan();
            Optional<KhachHang> khOpt = khachHangRepository.findBySdt(sdt);
            if (khOpt.isPresent()) {
                maKH = khOpt.get().getMaKH();
            } else {
                long count = khachHangRepository.count() + 1;
                maKH = String.format("KH%04d", count);
                while (khachHangRepository.existsById(maKH)) {
                    count++;
                    maKH = String.format("KH%04d", count);
                }
                KhachHang newKh = KhachHang.builder()
                        .maKH(maKH)
                        .hoTen(request.getTenNguoiNhan())
                        .sdt(request.getSdtNguoiNhan())
                        .diaChi(request.getDiaChiGiao())
                        .build();
                khachHangRepository.save(newKh);
            }
        }

        // Sinh mã đơn hàng dạng: DH + 6 số
        String maDH = "DH" + String.format("%06d", (int) (System.currentTimeMillis() % 1000000));
        while (orderRepository.existsById(maDH)) {
            maDH = "DH" + String.format("%06d", (int) ((System.currentTimeMillis() + 1) % 1000000));
        }

        // B3: Giá lấy từ MatHang.DONGIA trong DB, không tin giá từ client
        BigDecimal tongTien = BigDecimal.ZERO;
        List<ChiTietDonHangOnline> details = new ArrayList<>();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderRequestDTO.OrderItemDTO item : request.getItems()) {
                MatHang matHang = matHangRepository.findById(item.getMaHang())
                        .orElseThrow(() -> new RuntimeException("Mặt hàng không tồn tại: " + item.getMaHang()));
                BigDecimal donGia = matHang.getDonGia();
                int sl = (item.getSoLuong() != null && item.getSoLuong() > 0) ? item.getSoLuong() : 1;
                tongTien = tongTien.add(donGia.multiply(BigDecimal.valueOf(sl)));

                details.add(ChiTietDonHangOnline.builder()
                        .maDH(maDH)
                        .maHang(matHang.getMaHang())
                        .soLuong(sl)
                        .donGia(donGia)
                        .build());
            }
        }

        // Tạo đơn hàng online với trạng thái ban đầu là cho_xac_nhan
        DonHangOnline order = DonHangOnline.builder()
                .maDH(maDH)
                .maKH(maKH)
                .tenNguoiNhan(request.getTenNguoiNhan())
                .sdtNguoiNhan(request.getSdtNguoiNhan())
                .diaChiGiao(request.getDiaChiGiao())
                .phuongThucThanhToan(pttt)
                .tongTien(tongTien)
                .trangThai("cho_xac_nhan")
                .ngayDat(LocalDateTime.now())
                .build();

        DonHangOnline savedOrder = orderRepository.save(order);

        // Lưu chi tiết đơn hàng
        for (ChiTietDonHangOnline detail : details) {
            chiTietRepository.save(detail);
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + maDH));
        return toResponseDTO(order);
    }

    @Override
    public List<OrderResponseDTO> getOrdersByPhone(String phone) {
        return orderRepository.findBySdtNguoiNhanOrderByNgayDatDesc(phone)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private OrderResponseDTO toResponseDTO(DonHangOnline order) {
        List<ChiTietDonHangOnline> details = chiTietRepository.findByMaDH(order.getMaDH());
        List<OrderResponseDTO.OrderItemResponseDTO> items = details.stream().map(d ->
                OrderResponseDTO.OrderItemResponseDTO.builder()
                        .maHang(d.getMaHang())
                        .soLuong(d.getSoLuong())
                        .donGia(d.getDonGia())
                        .thanhTien(d.getDonGia().multiply(BigDecimal.valueOf(d.getSoLuong())))
                        .build()
        ).collect(Collectors.toList());

        return OrderResponseDTO.builder()
                .maDH(order.getMaDH())
                .tenNguoiNhan(order.getTenNguoiNhan())
                .sdtNguoiNhan(order.getSdtNguoiNhan())
                .diaChiGiao(order.getDiaChiGiao())
                .phuongThucThanhToan(order.getPhuongThucThanhToan())
                .tongTien(order.getTongTien())
                .trangThai(order.getTrangThai())
                .ngayDat(order.getNgayDat())
                .items(items)
                .build();
    }
}
