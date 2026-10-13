package com.cuahangdienthoai.order.service;

import com.cuahangdienthoai.customer.entity.KhachHang;
import com.cuahangdienthoai.customer.repository.KhachHangRepository;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.repository.NhanVienRepository;
import com.cuahangdienthoai.order.dto.ChiTietHoaDonDTO;
import com.cuahangdienthoai.order.dto.HoaDonDTO;
import com.cuahangdienthoai.order.entity.ChiTietHoaDon;
import com.cuahangdienthoai.order.entity.HoaDon;
import com.cuahangdienthoai.order.entity.KhuyenMai;
import com.cuahangdienthoai.order.repository.ChiTietHoaDonRepository;
import com.cuahangdienthoai.order.repository.HoaDonRepository;
import com.cuahangdienthoai.order.repository.KhuyenMaiRepository;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.supplier.entity.Imei;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;
    private final KhuyenMaiRepository khuyenMaiRepository;
    private final MatHangRepository matHangRepository;
    private final ImeiRepository imeiRepository;

    public List<HoaDonDTO> getAll() {
        return hoaDonRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public HoaDonDTO getById(String soHD) {
        return hoaDonRepository.findById(soHD)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn: " + soHD));
    }

    public List<HoaDonDTO> getByKhachHang(String maKH) {
        return hoaDonRepository.findByKhachHangMaKH(maKH).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public HoaDonDTO create(HoaDonDTO dto) {
        KhachHang kh = null;
        if (dto.getMaKH() != null && !dto.getMaKH().trim().isEmpty()) {
            kh = khachHangRepository.findById(dto.getMaKH()).orElse(null);
        }

        NhanVien nv = nhanVienRepository.findById(dto.getMaNV())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + dto.getMaNV()));

        KhuyenMai km = null;
        if (dto.getMaKM() != null && !dto.getMaKM().trim().isEmpty()) {
            km = khuyenMaiRepository.findById(dto.getMaKM()).orElse(null);
        }

        HoaDon hoaDon = HoaDon.builder()
                .soHD(dto.getSoHD())
                .ngayLap(LocalDateTime.now())
                .khachHang(kh)
                .nhanVien(nv)
                .khuyenMai(km)
                .kenhBan(dto.getKenhBan() != null ? dto.getKenhBan() : "tai_quay")
                .tongTien(dto.getTongTien() != null ? dto.getTongTien() : BigDecimal.ZERO)
                .tienGiamGia(dto.getTienGiamGia() != null ? dto.getTienGiamGia() : BigDecimal.ZERO)
                .phuongThucThanhToan(dto.getPhuongThucThanhToan() != null ? dto.getPhuongThucThanhToan() : "tien_mat")
                .build();

        hoaDon = hoaDonRepository.save(hoaDon);

        if (dto.getChiTiet() != null && !dto.getChiTiet().isEmpty()) {
            final HoaDon savedHd = hoaDon;
            List<ChiTietHoaDon> details = dto.getChiTiet().stream().map(ct -> {
                MatHang mh = matHangRepository.findById(ct.getMaHang())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + ct.getMaHang()));
                Imei imei = null;
                if (ct.getMaIMEI() != null && !ct.getMaIMEI().trim().isEmpty()) {
                    imei = imeiRepository.findById(ct.getMaIMEI()).orElse(null);
                    if (imei != null) {
                        imei.setTrangThai("da_ban");
                        imeiRepository.save(imei);
                    }
                }
                return ChiTietHoaDon.builder()
                        .hoaDon(savedHd)
                        .matHang(mh)
                        .imei(imei)
                        .slBan(ct.getSlBan() > 0 ? ct.getSlBan() : 1)
                        .donGiaBan(ct.getDonGiaBan())
                        .build();
            }).collect(Collectors.toList());

            chiTietHoaDonRepository.saveAll(details);
        }

        return toDTO(hoaDon);
    }

    @Transactional
    public void delete(String soHD) {
        List<ChiTietHoaDon> cthd = chiTietHoaDonRepository.findByHoaDonSoHD(soHD);
        chiTietHoaDonRepository.deleteAll(cthd);
        hoaDonRepository.deleteById(soHD);
    }

    private HoaDonDTO toDTO(HoaDon e) {
        BigDecimal thanhTien = (e.getTongTien() != null && e.getTienGiamGia() != null)
                ? e.getTongTien().subtract(e.getTienGiamGia()) : BigDecimal.ZERO;

        List<ChiTietHoaDonDTO> details = chiTietHoaDonRepository.findByHoaDonSoHD(e.getSoHD()).stream()
                .map(ct -> ChiTietHoaDonDTO.builder()
                        .maCTHD(ct.getMaCTHD())
                        .soHD(e.getSoHD())
                        .maHang(ct.getMatHang().getMaHang())
                        .tenHang(ct.getMatHang().getTenHang())
                        .maIMEI(ct.getImei() != null ? ct.getImei().getMaIMEI() : null)
                        .soIMEI(ct.getImei() != null ? ct.getImei().getSoIMEI() : null)
                        .slBan(ct.getSlBan())
                        .donGiaBan(ct.getDonGiaBan())
                        .thanhTien(ct.getDonGiaBan() != null ? ct.getDonGiaBan().multiply(BigDecimal.valueOf(ct.getSlBan())) : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());

        return HoaDonDTO.builder()
                .soHD(e.getSoHD())
                .ngayLap(e.getNgayLap() != null ? e.getNgayLap().toString() : null)
                .maKH(e.getKhachHang() != null ? e.getKhachHang().getMaKH() : null)
                .tenKhachHang(e.getKhachHang() != null ? e.getKhachHang().getHoTen() : "Khách lẻ")
                .maNV(e.getNhanVien() != null ? e.getNhanVien().getMaNV() : null)
                .tenNhanVien(e.getNhanVien() != null ? e.getNhanVien().getHoTen() : null)
                .maKM(e.getKhuyenMai() != null ? e.getKhuyenMai().getMaKM() : null)
                .tenKhuyenMai(e.getKhuyenMai() != null ? e.getKhuyenMai().getTenKM() : null)
                .kenhBan(e.getKenhBan())
                .tongTien(e.getTongTien())
                .tienGiamGia(e.getTienGiamGia())
                .thanhTien(thanhTien)
                .phuongThucThanhToan(e.getPhuongThucThanhToan())
                .chiTiet(details)
                .build();
    }
}
