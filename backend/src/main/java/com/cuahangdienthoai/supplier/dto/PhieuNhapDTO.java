package com.cuahangdienthoai.supplier.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhieuNhapDTO {
    private String soPNhap;
    private String ngayNhap;
    
    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    private String maNCC;
    
    private String tenNCC;
    private String maNV;
    private String tenNhanVien;
    
    @NotEmpty(message = "Chi tiết phiếu nhập không được để trống")
    @Valid
    private List<ChiTietPhieuNhapDTO> chiTiet;
}
