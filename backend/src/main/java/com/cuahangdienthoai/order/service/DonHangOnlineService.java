package com.cuahangdienthoai.order.service;

import com.cuahangdienthoai.order.dto.DonHangOnlineDTO;
import com.cuahangdienthoai.order.entity.DonHangOnline;
import com.cuahangdienthoai.order.repository.DonHangOnlineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonHangOnlineService {

    private final DonHangOnlineRepository donHangOnlineRepository;

    public List<DonHangOnlineDTO> getAll() {
        return donHangOnlineRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DonHangOnlineDTO getById(String maDH) {
        return donHangOnlineRepository.findById(maDH)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + maDH));
    }

    public List<DonHangOnlineDTO> getByTrangThai(String trangThai) {
        return donHangOnlineRepository.findByTrangThai(trangThai).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DonHangOnlineDTO> getByKhachHang(String maKH) {
        return donHangOnlineRepository.findByMaKH(maKH).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public DonHangOnlineDTO create(DonHangOnlineDTO dto) {
        DonHangOnline entity = DonHangOnline.builder()
                .maDH(dto.getMaDH()).maKH(dto.getMaKH())
                .tenNguoiNhan(dto.getTenNguoiNhan()).sdtNguoiNhan(dto.getSdtNguoiNhan())
                .diaChiGiao(dto.getDiaChiGiao())
                .phuongThucThanhToan(dto.getPhuongThucThanhToan())
                .tongTien(dto.getTongTien())
                .trangThai("cho_xac_nhan")
                .build();
        return toDTO(donHangOnlineRepository.save(entity));
    }

    @Transactional
    public DonHangOnlineDTO updateTrangThai(String maDH, String trangThai) {
        DonHangOnline entity = donHangOnlineRepository.findById(maDH)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + maDH));
        entity.setTrangThai(trangThai);
        return toDTO(donHangOnlineRepository.save(entity));
    }

    @Transactional
    public void delete(String maDH) {
        donHangOnlineRepository.deleteById(maDH);
    }

    private DonHangOnlineDTO toDTO(DonHangOnline e) {
        return DonHangOnlineDTO.builder()
                .maDH(e.getMaDH())
                .ngayDat(e.getNgayDat() != null ? e.getNgayDat().toString() : null)
                .maKH(e.getMaKH()).tenNguoiNhan(e.getTenNguoiNhan())
                .sdtNguoiNhan(e.getSdtNguoiNhan()).diaChiGiao(e.getDiaChiGiao())
                .phuongThucThanhToan(e.getPhuongThucThanhToan())
                .tongTien(e.getTongTien()).trangThai(e.getTrangThai())
                .maNV(e.getMaNV()).soHD(e.getSoHD())
                .build();
    }
}
