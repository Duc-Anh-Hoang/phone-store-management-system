package com.cuahangdienthoai.order.service;

import com.cuahangdienthoai.order.dto.OrderRequestDTO;
import com.cuahangdienthoai.order.dto.OrderResponseDTO;
import java.util.List;

public interface OrderService {
    OrderResponseDTO createOrder(OrderRequestDTO request);
    OrderResponseDTO getOrderById(String maDH);
    OrderResponseDTO getOrderByIdAndPhone(String maDH, String sdt);
    List<OrderResponseDTO> getOrdersByPhone(String sdt);
}
