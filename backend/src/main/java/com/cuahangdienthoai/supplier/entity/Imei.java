package com.cuahangdienthoai.supplier.entity;

import com.cuahangdienthoai.product.entity.MatHang;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "IMEI")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Imei {
    @Id
    @Column(name = "MAIMEI", length = 20)
    private String maIMEI;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumns({
        @JoinColumn(name = "SOPN", referencedColumnName = "SOPN"),
        @JoinColumn(name = "MAHANG", referencedColumnName = "MAHANG")
    })
    private ChiTietPhieuNhap chiTietPhieuNhap;

    @Column(name = "SOIMEI", length = 20, nullable = false, unique = true)
    private String soIMEI;

    @Column(name = "TRANGTHAI", length = 20, nullable = false)
    @Builder.Default
    private String trangThai = "con_hang"; // 'con_hang', 'da_ban', 'tra_hang'

    /** Helper: lấy MatHang qua ChiTietPhieuNhap */
    public MatHang getMatHang() {
        return chiTietPhieuNhap != null ? chiTietPhieuNhap.getMatHang() : null;
    }
}
