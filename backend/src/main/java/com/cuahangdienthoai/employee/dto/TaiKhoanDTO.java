package com.cuahangdienthoai.employee.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaiKhoanDTO {
    private String username;
    private String maNV;
    private String tenNhanVien;
    private String maQuyen;
    private String tenQuyen;
    private String trangThai;
    private String ngayTao;
}
