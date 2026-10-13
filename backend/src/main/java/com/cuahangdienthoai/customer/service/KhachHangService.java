package com.cuahangdienthoai.customer.service;

import com.cuahangdienthoai.customer.dto.KhachHangDTO;
import com.cuahangdienthoai.customer.entity.KhachHang;
import com.cuahangdienthoai.customer.repository.KhachHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KhachHangService {

    private final KhachHangRepository khachHangRepository;

    public List<KhachHangDTO> getAll() {
        return khachHangRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public KhachHangDTO getById(String maKH) {
        return khachHangRepository.findById(maKH)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng: " + maKH));
    }

    public KhachHangDTO getBySdt(String sdt) {
        return khachHangRepository.findBySdt(sdt)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với SĐT: " + sdt));
    }

    @Transactional
    public KhachHangDTO create(KhachHangDTO dto) {
        KhachHang entity = KhachHang.builder()
                .maKH(dto.getMaKH()).hoTen(dto.getHoTen())
                .diaChi(dto.getDiaChi()).sdt(dto.getSdt()).email(dto.getEmail())
                .build();
        return toDTO(khachHangRepository.save(entity));
    }

    @Transactional
    public KhachHangDTO update(String maKH, KhachHangDTO dto) {
        KhachHang entity = khachHangRepository.findById(maKH)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng: " + maKH));
        entity.setHoTen(dto.getHoTen());
        entity.setDiaChi(dto.getDiaChi());
        entity.setSdt(dto.getSdt());
        entity.setEmail(dto.getEmail());
        return toDTO(khachHangRepository.save(entity));
    }

    @Transactional
    public void delete(String maKH) {
        khachHangRepository.deleteById(maKH);
    }

    private KhachHangDTO toDTO(KhachHang e) {
        return KhachHangDTO.builder()
                .maKH(e.getMaKH()).hoTen(e.getHoTen())
                .diaChi(e.getDiaChi()).sdt(e.getSdt()).email(e.getEmail())
                .build();
    }
}
