package com.cuahangdienthoai.supplier.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NhaCungCap")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NhaCungCap {
    @Id
    @Column(name = "MANCC", length = 10)
    private String maNCC;

    @Column(name = "TENNCC", length = 100, nullable = false)
    private String tenNCC;

    @Column(name = "DIACHI", length = 255)
    private String diaChi;

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "EMAIL", length = 100)
    private String email;
}
