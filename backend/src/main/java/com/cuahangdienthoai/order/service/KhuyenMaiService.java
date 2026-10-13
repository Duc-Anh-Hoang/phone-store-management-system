package com.cuahangdienthoai.order.service;

import com.cuahangdienthoai.order.dto.KhuyenMaiDTO;
import com.cuahangdienthoai.order.entity.KhuyenMai;
import com.cuahangdienthoai.order.repository.KhuyenMaiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KhuyenMaiService {

    private final KhuyenMaiRepository khuyenMaiRepository;

    public List<KhuyenMaiDTO> getAll() {
        return khuyenMaiRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public KhuyenMaiDTO getById(String maKM) {
        return khuyenMaiRepository.findById(maKM)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi: " + maKM));
    }

    public List<KhuyenMaiDTO> getDangHoatDong() {
        return khuyenMaiRepository.findByTamDung(false).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public KhuyenMaiDTO create(KhuyenMaiDTO dto) {
        KhuyenMai entity = KhuyenMai.builder()
                .maKM(dto.getMaKM()).tenKM(dto.getTenKM())
                .phanTramGiam(dto.getPhanTramGiam())
                .ngayBD(LocalDateTime.parse(dto.getNgayBD()))
                .ngayKT(LocalDateTime.parse(dto.getNgayKT()))
                .tamDung(dto.isTamDung())
                .build();
        return toDTO(khuyenMaiRepository.save(entity));
    }

    @Transactional
    public KhuyenMaiDTO update(String maKM, KhuyenMaiDTO dto) {
        KhuyenMai entity = khuyenMaiRepository.findById(maKM)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi: " + maKM));
        entity.setTenKM(dto.getTenKM());
        entity.setPhanTramGiam(dto.getPhanTramGiam());
        entity.setNgayBD(LocalDateTime.parse(dto.getNgayBD()));
        entity.setNgayKT(LocalDateTime.parse(dto.getNgayKT()));
        entity.setTamDung(dto.isTamDung());
        return toDTO(khuyenMaiRepository.save(entity));
    }

    @Transactional
    public void delete(String maKM) {
        khuyenMaiRepository.deleteById(maKM);
    }

    private KhuyenMaiDTO toDTO(KhuyenMai e) {
        return KhuyenMaiDTO.builder()
                .maKM(e.getMaKM()).tenKM(e.getTenKM())
                .phanTramGiam(e.getPhanTramGiam())
                .ngayBD(e.getNgayBD() != null ? e.getNgayBD().toString() : null)
                .ngayKT(e.getNgayKT() != null ? e.getNgayKT().toString() : null)
                .tamDung(e.isTamDung())
                .build();
    }
}
