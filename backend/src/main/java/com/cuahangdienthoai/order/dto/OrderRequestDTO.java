package com.cuahangdienthoai.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại phải đúng 10 chữ số bắt đầu bằng 0")
    private String sdtNguoiNhan;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String diaChiGiao;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    @Pattern(regexp = "^(cod|chuyen_khoan|the)$", message = "Phương thức thanh toán phải là cod, chuyen_khoan hoặc the")
    private String phuongThucThanhToan; // 'cod', 'chuyen_khoan', 'the'

    private String maKH; // Mã khách hàng (nếu có, hoặc hệ thống tự sinh KH...)

    private String ghiChu;

    @NotNull(message = "Danh sách sản phẩm không được trống")
    @NotEmpty(message = "Danh sách sản phẩm không được trống")
    @Valid
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
        @Min(value = 1, message = "Số lượng mỗi dòng phải lớn hơn hoặc bằng 1")
        @Max(value = 10, message = "Số lượng mỗi dòng không được vượt quá 10")
        private Integer soLuong;
        
        @NotNull(message = "Đơn giá không được trống")
        private BigDecimal donGia;
        
        private String mauSac;
        private String dungLuong;
    }
}
