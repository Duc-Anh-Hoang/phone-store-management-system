package com.cuahangdienthoai.supplier.service;

import com.cuahangdienthoai.supplier.dto.NhaCungCapDTO;
import com.cuahangdienthoai.supplier.entity.NhaCungCap;
import com.cuahangdienthoai.supplier.repository.NhaCungCapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NhaCungCapService {

    private final NhaCungCapRepository nhaCungCapRepository;

    public List<NhaCungCapDTO> getAll() {
        return nhaCungCapRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public NhaCungCapDTO getById(String maNCC) {
        return nhaCungCapRepository.findById(maNCC)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp: " + maNCC));
    }

    @Transactional
    public NhaCungCapDTO create(NhaCungCapDTO dto) {
        NhaCungCap entity = NhaCungCap.builder()
                .maNCC(dto.getMaNCC()).tenNCC(dto.getTenNCC())
                .diaChi(dto.getDiaChi()).sdt(dto.getSdt()).email(dto.getEmail())
                .build();
        return toDTO(nhaCungCapRepository.save(entity));
    }

    @Transactional
    public NhaCungCapDTO update(String maNCC, NhaCungCapDTO dto) {
        NhaCungCap entity = nhaCungCapRepository.findById(maNCC)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp: " + maNCC));
        entity.setTenNCC(dto.getTenNCC());
        entity.setDiaChi(dto.getDiaChi());
        entity.setSdt(dto.getSdt());
        entity.setEmail(dto.getEmail());
        return toDTO(nhaCungCapRepository.save(entity));
    }

    @Transactional
    public void delete(String maNCC) {
        nhaCungCapRepository.deleteById(maNCC);
    }

    private NhaCungCapDTO toDTO(NhaCungCap e) {
        return NhaCungCapDTO.builder()
                .maNCC(e.getMaNCC()).tenNCC(e.getTenNCC())
                .diaChi(e.getDiaChi()).sdt(e.getSdt()).email(e.getEmail())
                .build();
    }
}
