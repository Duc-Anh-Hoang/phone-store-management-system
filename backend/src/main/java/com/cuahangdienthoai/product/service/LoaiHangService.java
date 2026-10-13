package com.cuahangdienthoai.product.service;

import com.cuahangdienthoai.product.dto.LoaiHangDTO;
import com.cuahangdienthoai.product.entity.LoaiHang;
import com.cuahangdienthoai.product.repository.LoaiHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoaiHangService {
    private final LoaiHangRepository loaiHangRepository;

    public List<LoaiHangDTO> getAll() {
        return loaiHangRepository.findAll().stream()
                .map(e -> new LoaiHangDTO(e.getMaLoai(), e.getTenLoai()))
                .collect(Collectors.toList());
    }

    public LoaiHangDTO getById(String maLoai) {
        return loaiHangRepository.findById(maLoai)
                .map(e -> new LoaiHangDTO(e.getMaLoai(), e.getTenLoai()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại hàng: " + maLoai));
    }

    @Transactional
    public LoaiHangDTO create(LoaiHangDTO dto) {
        LoaiHang entity = new LoaiHang(dto.getMaLoai(), dto.getTenLoai());
        return new LoaiHangDTO(loaiHangRepository.save(entity).getMaLoai(), dto.getTenLoai());
    }

    @Transactional
    public LoaiHangDTO update(String maLoai, LoaiHangDTO dto) {
        LoaiHang entity = loaiHangRepository.findById(maLoai)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại hàng: " + maLoai));
        entity.setTenLoai(dto.getTenLoai());
        return new LoaiHangDTO(loaiHangRepository.save(entity).getMaLoai(), entity.getTenLoai());
    }

    @Transactional
    public void delete(String maLoai) { loaiHangRepository.deleteById(maLoai); }
}
