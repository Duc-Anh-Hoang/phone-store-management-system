package com.cuahangdienthoai.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDTO {

    @NotBlank(message = "Họ và tên người nhận không được để trống")
    private String tenNguoiNhan;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0)[0-9]{9}$", message = "Số điện thoại không đúng định dạng 10 chữ số")
    private String sdtNguoiNhan;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String diaChiGiao;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String phuongThucThanhToan; // 'cod', 'chuyen_khoan', 'the'

    private String maKH; // Mã khách hàng (nếu có, hoặc hệ thống tự sinh KH...)

    private String ghiChu;

    @NotNull(message = "Danh sách sản phẩm không được trống")
    private List<OrderItemDTO> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDTO {
        @NotBlank(message = "Mã hàng không được trống")
        private String maHang;
        
        @NotNull(message = "Số lượng không được trống")
        private Integer soLuong;
        
        @NotNull(message = "Đơn giá không được trống")
        private BigDecimal donGia;
        
        private String mauSac;
        private String dungLuong;
    }
}
