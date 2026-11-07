package com.cuahangdienthoai.warranty.service;

import com.cuahangdienthoai.warranty.dto.BaoHanhDTO;
import com.cuahangdienthoai.warranty.entity.BaoHanh;
import com.cuahangdienthoai.warranty.repository.BaoHanhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BaoHanhService {

    private final BaoHanhRepository baoHanhRepository;

    public List<BaoHanhDTO> getAll() {
        return baoHanhRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public BaoHanhDTO getById(String maBH) {
        return baoHanhRepository.findById(maBH)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảo hành: " + maBH));
    }

    public BaoHanhDTO getByIMEI(String query) {
        return baoHanhRepository.findByImeiMaIMEI(query)
                .or(() -> baoHanhRepository.findByImeiSoIMEI(query))
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bảo hành cho IMEI: " + query));
    }

    @Transactional
    public void delete(String maBH) {
        baoHanhRepository.deleteById(maBH);
    }

    private BaoHanhDTO toDTO(BaoHanh e) {
        LocalDateTime ngayKT = e.getNgayBD() != null
                ? e.getNgayBD().plusMonths(e.getThoiHanThang()) : null;
        
        Integer soNgayConLai = null;
        String trangThai = "con_han";
        if (ngayKT != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), ngayKT.toLocalDate());
            soNgayConLai = (int) days;
            if (days < 0) {
                trangThai = "het_han";
            }
        }

        return BaoHanhDTO.builder()
                .maBH(e.getMaBH())
                .soHD(e.getHoaDon().getSoHD())
                .maIMEI(e.getImei().getMaIMEI())
                .soIMEI(e.getImei().getSoIMEI())
                .maHang(e.getImei().getChiTietPhieuNhap() != null ?
                        e.getImei().getChiTietPhieuNhap().getMatHang().getMaHang() : null)
                .tenHang(e.getImei().getChiTietPhieuNhap() != null ?
                        e.getImei().getChiTietPhieuNhap().getMatHang().getTenHang() : null)
                .ngayBD(e.getNgayBD() != null ? e.getNgayBD().toString() : null)
                .ngayKT(ngayKT != null ? ngayKT.toString() : null)
                .thoiHanThang(e.getThoiHanThang())
                .dieuKien(e.getDieuKien())
                .trangThai(trangThai)
                .soNgayConLai(soNgayConLai)
                .build();
    }
}
