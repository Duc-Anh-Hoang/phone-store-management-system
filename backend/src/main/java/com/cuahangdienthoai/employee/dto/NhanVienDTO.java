package com.cuahangdienthoai.employee.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NhanVienDTO {
    private String maNV;
    private String hoTen;
    private String chucVu;
    private String sdt;
    private String email;
    private String ngayVaoLam;
    private String trangThai;
}
