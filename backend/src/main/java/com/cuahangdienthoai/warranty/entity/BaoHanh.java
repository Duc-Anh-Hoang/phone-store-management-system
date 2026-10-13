package com.cuahangdienthoai.warranty.entity;

import com.cuahangdienthoai.order.entity.HoaDon;
import com.cuahangdienthoai.supplier.entity.Imei;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "BaoHanh")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BaoHanh {
    @Id
    @Column(name = "MABH", length = 15)
    private String maBH;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "SOHD", nullable = false)
    private HoaDon hoaDon;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MAIMEI", nullable = false, unique = true)
    private Imei imei;

    @Column(name = "NGAYBD", nullable = false)
    private LocalDateTime ngayBD;

    @Column(name = "THOIHANTHANG", nullable = false)
    private int thoiHanThang;

    @Column(name = "DIEUKIEN", length = 255)
    private String dieuKien;
}
