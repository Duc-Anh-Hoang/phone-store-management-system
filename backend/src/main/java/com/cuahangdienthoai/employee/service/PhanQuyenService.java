package com.cuahangdienthoai.employee.service;

import com.cuahangdienthoai.employee.dto.PhanQuyenDTO;
import com.cuahangdienthoai.employee.entity.PhanQuyen;
import com.cuahangdienthoai.employee.repository.PhanQuyenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhanQuyenService {

    private final PhanQuyenRepository phanQuyenRepository;

    public List<PhanQuyenDTO> getAll() {
        return phanQuyenRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PhanQuyenDTO getById(String maQuyen) {
        return phanQuyenRepository.findById(maQuyen)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân quyền: " + maQuyen));
    }

    @Transactional
    public PhanQuyenDTO create(PhanQuyenDTO dto) {
        PhanQuyen entity = PhanQuyen.builder()
                .maQuyen(dto.getMaQuyen())
                .tenQuyen(dto.getTenQuyen())
                .moTa(dto.getMoTa())
                .build();
        return toDTO(phanQuyenRepository.save(entity));
    }

    @Transactional
    public PhanQuyenDTO update(String maQuyen, PhanQuyenDTO dto) {
        PhanQuyen entity = phanQuyenRepository.findById(maQuyen)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân quyền: " + maQuyen));
        entity.setTenQuyen(dto.getTenQuyen());
        entity.setMoTa(dto.getMoTa());
        return toDTO(phanQuyenRepository.save(entity));
    }

    @Transactional
    public void delete(String maQuyen) {
        phanQuyenRepository.deleteById(maQuyen);
    }

    private PhanQuyenDTO toDTO(PhanQuyen e) {
        return PhanQuyenDTO.builder()
                .maQuyen(e.getMaQuyen())
                .tenQuyen(e.getTenQuyen())
                .moTa(e.getMoTa())
                .build();
    }
}
