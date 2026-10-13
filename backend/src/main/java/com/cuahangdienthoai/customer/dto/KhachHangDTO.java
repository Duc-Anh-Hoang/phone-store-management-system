package com.cuahangdienthoai.customer.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KhachHangDTO {
    private String maKH;
    private String hoTen;
    private String diaChi;
    private String sdt;
    private String email;
}
