package com.cuahangdienthoai.supplier.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietPhieuNhapDTO {
    private String soPNhap;
    private String maHang;
    private String tenHang;

    @JsonProperty("slNhap")
    @JsonAlias({"soLuong", "sl"})
    private int slNhap;

    @JsonProperty("donGiaNhap")
    @JsonAlias({"donGia", "giaNhap"})
    private BigDecimal donGiaNhap;
}
