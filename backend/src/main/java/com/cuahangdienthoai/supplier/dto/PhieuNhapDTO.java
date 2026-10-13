package com.cuahangdienthoai.supplier.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhieuNhapDTO {
    private String soPNhap;
    private String ngayNhap;
    private String maNCC;
    private String tenNCC;
    private String maNV;
    private String tenNhanVien;
    private List<ChiTietPhieuNhapDTO> chiTiet;
}
