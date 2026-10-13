package com.cuahangdienthoai.supplier.service;

import com.cuahangdienthoai.supplier.dto.ImeiDTO;
import com.cuahangdienthoai.supplier.entity.Imei;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImeiService {

    private final ImeiRepository imeiRepository;

    public List<ImeiDTO> getAll() {
        return imeiRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ImeiDTO> getByTrangThai(String trangThai) {
        return imeiRepository.findByTrangThai(trangThai).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ImeiDTO> getByMatHang(String maHang) {
        return imeiRepository.findByChiTietPhieuNhapMatHangMaHang(maHang).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ImeiDTO getBySoIMEI(String soIMEI) {
        return imeiRepository.findBySoIMEI(soIMEI)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy IMEI: " + soIMEI));
    }

    @Transactional
    public ImeiDTO updateTrangThai(String maIMEI, String trangThai) {
        Imei entity = imeiRepository.findById(maIMEI)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy IMEI: " + maIMEI));
        entity.setTrangThai(trangThai);
        return toDTO(imeiRepository.save(entity));
    }

    private ImeiDTO toDTO(Imei e) {
        return ImeiDTO.builder()
                .maIMEI(e.getMaIMEI())
                .soIMEI(e.getSoIMEI())
                .maHang(e.getChiTietPhieuNhap() != null ? e.getChiTietPhieuNhap().getMatHang().getMaHang() : null)
                .tenHang(e.getChiTietPhieuNhap() != null ? e.getChiTietPhieuNhap().getMatHang().getTenHang() : null)
                .soPNhap(e.getChiTietPhieuNhap() != null ? e.getChiTietPhieuNhap().getPhieuNhap().getSoPNhap() : null)
                .trangThai(e.getTrangThai())
                .build();
    }
}
