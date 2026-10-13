package com.cuahangdienthoai.order.entity;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ChiTietDonHangOnlineId implements Serializable {
    private String maDH;
    private String maHang;
}
