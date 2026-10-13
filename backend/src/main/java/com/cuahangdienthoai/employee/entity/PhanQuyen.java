package com.cuahangdienthoai.employee.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PhanQuyen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhanQuyen {

    @Id
    @Column(name = "MAQUYEN", length = 10)
    private String maQuyen;

    @Column(name = "TENQUYEN", length = 50, nullable = false, unique = true)
    private String tenQuyen;

    @Column(name = "MOTA", length = 255)
    private String moTa;
}
