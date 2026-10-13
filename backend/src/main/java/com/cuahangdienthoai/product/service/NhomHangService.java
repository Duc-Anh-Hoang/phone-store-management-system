package com.cuahangdienthoai.product.service;

import com.cuahangdienthoai.product.dto.NhomHangDTO;
import com.cuahangdienthoai.product.entity.NhomHang;
import com.cuahangdienthoai.product.repository.NhomHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NhomHangService {
    private final NhomHangRepository nhomHangRepository;

    public List<NhomHangDTO> getAll() {
        return nhomHangRepository.findAll().stream()
                .map(e -> new NhomHangDTO(e.getMaNhom(), e.getTenNhom()))
                .collect(Collectors.toList());
    }

    public NhomHangDTO getById(String maNhom) {
        return nhomHangRepository.findById(maNhom)
                .map(e -> new NhomHangDTO(e.getMaNhom(), e.getTenNhom()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm hàng: " + maNhom));
    }

    @Transactional
    public NhomHangDTO create(NhomHangDTO dto) {
        NhomHang entity = new NhomHang(dto.getMaNhom(), dto.getTenNhom());
        return new NhomHangDTO(nhomHangRepository.save(entity).getMaNhom(), dto.getTenNhom());
    }

    @Transactional
    public NhomHangDTO update(String maNhom, NhomHangDTO dto) {
        NhomHang entity = nhomHangRepository.findById(maNhom)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm hàng: " + maNhom));
        entity.setTenNhom(dto.getTenNhom());
        return new NhomHangDTO(nhomHangRepository.save(entity).getMaNhom(), entity.getTenNhom());
    }

    @Transactional
    public void delete(String maNhom) { nhomHangRepository.deleteById(maNhom); }
}
