package com.cuahangdienthoai.common.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThamSoDTO {
    private String maThamSo;
    private String tenThamSo;
    private BigDecimal giaTri;
    private String donVi;
}
