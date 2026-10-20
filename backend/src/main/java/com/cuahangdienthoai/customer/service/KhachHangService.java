package com.cuahangdienthoai.customer.service;

import com.cuahangdienthoai.customer.dto.KhachHangDTO;
import com.cuahangdienthoai.customer.entity.KhachHang;
import com.cuahangdienthoai.customer.repository.KhachHangRepository;
import com.cuahangdienthoai.customer.repository.KhachHangThanThietProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KhachHangService {

    private final KhachHangRepository khachHangRepository;

    private Map<String, KhachHangThanThietProjection> loadDiemMap() {
        return khachHangRepository.findAllDiemTichLuy().stream()
                .collect(Collectors.toMap(
                        KhachHangThanThietProjection::getMaKH,
                        p -> p,
                        (existing, replacement) -> existing
                ));
    }

    public List<KhachHangDTO> getAll() {
        Map<String, KhachHangThanThietProjection> map = loadDiemMap();
        return khachHangRepository.findAll().stream()
                .map(e -> toDTO(e, map.get(e.getMaKH())))
                .collect(Collectors.toList());
    }

    public KhachHangDTO getById(String maKH) {
        KhachHangThanThietProjection p = khachHangRepository.findDiemTichLuyByMaKH(maKH).orElse(null);
        return khachHangRepository.findById(maKH)
                .map(e -> toDTO(e, p))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng: " + maKH));
    }

    public KhachHangDTO getBySdt(String sdt) {
        KhachHang entity = khachHangRepository.findBySdt(sdt)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với SĐT: " + sdt));
        KhachHangThanThietProjection p = khachHangRepository.findDiemTichLuyByMaKH(entity.getMaKH()).orElse(null);
        return toDTO(entity, p);
    }

    @Transactional
    public KhachHangDTO create(KhachHangDTO dto) {
        KhachHang entity = KhachHang.builder()
                .maKH(dto.getMaKH()).hoTen(dto.getHoTen())
                .diaChi(dto.getDiaChi()).sdt(dto.getSdt()).email(dto.getEmail())
                .build();
        KhachHang saved = khachHangRepository.save(entity);
        return toDTO(saved, null);
    }

    @Transactional
    public KhachHangDTO update(String maKH, KhachHangDTO dto) {
        KhachHang entity = khachHangRepository.findById(maKH)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng: " + maKH));
        entity.setHoTen(dto.getHoTen());
        entity.setDiaChi(dto.getDiaChi());
        entity.setSdt(dto.getSdt());
        entity.setEmail(dto.getEmail());
        KhachHang saved = khachHangRepository.save(entity);
        KhachHangThanThietProjection p = khachHangRepository.findDiemTichLuyByMaKH(maKH).orElse(null);
        return toDTO(saved, p);
    }

    @Transactional
    public void delete(String maKH) {
        khachHangRepository.deleteById(maKH);
    }

    private KhachHangDTO toDTO(KhachHang e, KhachHangThanThietProjection p) {
        return KhachHangDTO.builder()
                .maKH(e.getMaKH()).hoTen(e.getHoTen())
                .diaChi(e.getDiaChi()).sdt(e.getSdt()).email(e.getEmail())
                .diemTichLuy(p != null ? p.getDiemTichLuy() : 0L)
                .tongChiTieu(p != null && p.getTongChiTieu() != null ? p.getTongChiTieu() : BigDecimal.ZERO)
                .build();
    }
}
