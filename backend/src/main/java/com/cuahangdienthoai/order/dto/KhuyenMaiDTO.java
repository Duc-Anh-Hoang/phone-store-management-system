package com.cuahangdienthoai.order.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KhuyenMaiDTO {
    private String maKM;
    private String tenKM;
    private BigDecimal phanTramGiam;
    private String ngayBD;
    private String ngayKT;
    private boolean tamDung;
}
