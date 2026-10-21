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
    private final com.cuahangdienthoai.common.CodeGenerator codeGenerator;

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu đơn hàng không được để trống");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Danh sách mặt hàng không được để trống");
        }

        // Gộp các dòng trùng maHang, kiểm tra maHang và soLuong
        java.util.Map<String, Integer> mergedItems = new java.util.LinkedHashMap<>();
        for (OrderRequestDTO.OrderItemDTO item : request.getItems()) {
            if (item.getMaHang() == null || item.getMaHang().trim().isEmpty()) {
                throw new IllegalArgumentException("Thiếu mã hàng");
            }
            if (item.getSoLuong() == null || item.getSoLuong() < 1 || item.getSoLuong() > 10) {
                throw new IllegalArgumentException("Số lượng mỗi dòng phải từ 1 đến 10");
            }
            String maHang = item.getMaHang().trim();
            mergedItems.put(maHang, mergedItems.getOrDefault(maHang, 0) + item.getSoLuong());
        }

        // So với tồn kho từ vw_TonKho (S4) trước khi tiếp tục
        for (java.util.Map.Entry<String, Integer> entry : mergedItems.entrySet()) {
            String maHang = entry.getKey();
            int qty = entry.getValue();
            var tkOpt = matHangRepository.findTonKhoByMaHang(maHang);
            int tonKho = (tkOpt.isPresent() && tkOpt.get().getTonKho() != null) ? tkOpt.get().getTonKho() : 0;
            if (tonKho < qty) {
                throw new IllegalArgumentException("Mặt hàng " + maHang + " chỉ còn " + tonKho + " sản phẩm");
            }
        }

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
                maKH = codeGenerator.generateNextMaKH();
                KhachHang newKh = KhachHang.builder()
                        .maKH(maKH)
                        .hoTen(request.getTenNguoiNhan())
                        .sdt(request.getSdtNguoiNhan())
                        .diaChi(request.getDiaChiGiao())
                        .build();
                khachHangRepository.save(newKh);
            }
        }

        // Sinh mã đơn hàng dạng: DH + 6 số (M2)
        String maDH = codeGenerator.generateNextMaDH();

        // B3: Giá lấy từ MatHang.DONGIA trong DB, không tin giá từ client
        BigDecimal tongTien = BigDecimal.ZERO;
        List<ChiTietDonHangOnline> details = new ArrayList<>();

        for (java.util.Map.Entry<String, Integer> entry : mergedItems.entrySet()) {
            String maHang = entry.getKey();
            int qty = entry.getValue();

            MatHang matHang = matHangRepository.findById(maHang)
                    .orElseThrow(() -> new IllegalArgumentException("Mặt hàng không tồn tại: " + maHang));
            BigDecimal donGia = matHang.getDonGia();
            tongTien = tongTien.add(donGia.multiply(BigDecimal.valueOf(qty)));

            details.add(ChiTietDonHangOnline.builder()
                    .maDH(maDH)
                    .maHang(matHang.getMaHang())
                    .soLuong(qty)
                    .donGia(donGia)
                    .build());
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
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng: " + maDH));
        return toResponseDTO(order);
    }

    @Override
    public OrderResponseDTO getOrderByIdAndPhone(String maDH, String sdt) {
        if (sdt == null || sdt.trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Vui lòng cung cấp số điện thoại khi tra cứu đơn hàng");
        }
        DonHangOnline order = orderRepository.findById(maDH)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng: " + maDH));
        if (order.getSdtNguoiNhan() == null || !order.getSdtNguoiNhan().trim().equals(sdt.trim())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng hoặc số điện thoại không khớp");
        }
        return toResponseDTO(order);
    }

    @Override
    public List<OrderResponseDTO> getOrdersByPhone(String phone) {
        return orderRepository.findBySdtNguoiNhanOrderByNgayDatDesc(phone)
                .stream()
                .map(this::toRedactedResponseDTO)
                .collect(Collectors.toList());
    }

    private OrderResponseDTO toRedactedResponseDTO(DonHangOnline order) {
        OrderResponseDTO dto = toResponseDTO(order);
        dto.setSdtNguoiNhan(maskPhone(order.getSdtNguoiNhan()));
        dto.setDiaChiGiao("*** (Địa chỉ đã ẩn vì lý do bảo mật)");
        return dto;
    }

    private String maskPhone(String phone) {
        if (phone == null) return "";
        String trimmed = phone.trim();
        if (trimmed.length() <= 5) return trimmed;
        int len = trimmed.length();
        return trimmed.substring(0, 2) + "x".repeat(len - 5) + trimmed.substring(len - 3);
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
