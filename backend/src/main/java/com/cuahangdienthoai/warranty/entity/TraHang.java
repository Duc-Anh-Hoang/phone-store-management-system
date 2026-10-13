package com.cuahangdienthoai.warranty.entity;

import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.order.entity.HoaDon;
import com.cuahangdienthoai.supplier.entity.Imei;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TraHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TraHang {
    @Id
    @Column(name = "MATR", length = 15)
    private String maTR;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "SOHD", nullable = false)
    private HoaDon hoaDon;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MAIMEI", nullable = false, unique = true)
    private Imei imei;

    @Column(name = "NGAYTR", nullable = false)
    @Builder.Default
    private LocalDateTime ngayTR = LocalDateTime.now();

    @Column(name = "LYDO", length = 255, nullable = false)
    private String lyDo;

    @Column(name = "HINHTHUCHOANTIEN", length = 20, nullable = false)
    private String hinhThucHoanTien; // 'tien_mat', 'chuyen_khoan', 'doi_hang'

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANV", nullable = false)
    private NhanVien nhanVien;
}
