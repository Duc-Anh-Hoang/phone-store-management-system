package com.cuahangdienthoai.order.controller;

import com.cuahangdienthoai.order.dto.OrderRequestDTO;
import com.cuahangdienthoai.order.dto.OrderResponseDTO;
import com.cuahangdienthoai.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Hỗ trợ kết nối trực tiếp từ Frontend Landing Page
public class OrderController {

    private final OrderService orderService;

    /**
     * API tiếp nhận đơn đặt hàng từ Landing Page
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody OrderRequestDTO request) {
        OrderResponseDTO response = orderService.createOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * API tra cứu chi tiết đơn hàng theo mã (phải kèm SĐT xác thực)
     * GET /api/orders/{id}?sdt=...
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @PathVariable("id") String maDH,
            @RequestParam(value = "sdt", required = false) String sdt) {
        OrderResponseDTO response = orderService.getOrderByIdAndPhone(maDH, sdt);
        return ResponseEntity.ok(response);
    }

    /**
     * API tra cứu danh sách đơn hàng theo số điện thoại người nhận (trả dữ liệu rút gọn, che giữa SĐT)
     * GET /api/orders/phone/{phone}
     */
    @GetMapping("/phone/{phone}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByPhone(@PathVariable("phone") String phone) {
        List<OrderResponseDTO> response = orderService.getOrdersByPhone(phone);
        return ResponseEntity.ok(response);
    }
}
