package com.cuahangdienthoai.product.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietThuocTinhDTO {
    private String maHang;
    private String maThuocTinh;
    private String tenThuocTinh;
    private String giaTri;
}
