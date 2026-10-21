package com.cuahangdienthoai.supplier.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietPhieuNhapDTO {
    private String soPNhap;
    
    @NotBlank(message = "Mã hàng không được để trống")
    private String maHang;
    
    private String tenHang;

    @Min(value = 1, message = "Số lượng nhập phải lớn hơn 0")
    @JsonProperty("slNhap")
    @JsonAlias({"soLuong", "sl"})
    private int slNhap;

    @JsonProperty("donGiaNhap")
    @JsonAlias({"donGia", "giaNhap"})
    private BigDecimal donGiaNhap;

    @JsonProperty("danhSachImei")
    @JsonAlias({"imeis", "danhSachIMEI", "imeiList"})
    private List<String> danhSachImei;
}
