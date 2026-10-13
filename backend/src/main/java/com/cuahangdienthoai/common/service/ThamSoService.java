package com.cuahangdienthoai.common.service;

import com.cuahangdienthoai.common.dto.ThamSoDTO;
import com.cuahangdienthoai.common.entity.ThamSo;
import com.cuahangdienthoai.common.repository.ThamSoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThamSoService {

    private final ThamSoRepository thamSoRepository;

    public List<ThamSoDTO> getAll() {
        return thamSoRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ThamSoDTO getById(String maThamSo) {
        return thamSoRepository.findById(maThamSo)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tham số: " + maThamSo));
    }

    @Transactional
    public ThamSoDTO create(ThamSoDTO dto) {
        ThamSo entity = ThamSo.builder()
                .maThamSo(dto.getMaThamSo())
                .tenThamSo(dto.getTenThamSo())
                .giaTri(dto.getGiaTri())
                .donVi(dto.getDonVi())
                .build();
        return toDTO(thamSoRepository.save(entity));
    }

    @Transactional
    public ThamSoDTO update(String maThamSo, ThamSoDTO dto) {
        ThamSo entity = thamSoRepository.findById(maThamSo)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tham số: " + maThamSo));
        entity.setTenThamSo(dto.getTenThamSo());
        entity.setGiaTri(dto.getGiaTri());
        entity.setDonVi(dto.getDonVi());
        return toDTO(thamSoRepository.save(entity));
    }

    @Transactional
    public void delete(String maThamSo) {
        thamSoRepository.deleteById(maThamSo);
    }

    private ThamSoDTO toDTO(ThamSo e) {
        return ThamSoDTO.builder()
                .maThamSo(e.getMaThamSo())
                .tenThamSo(e.getTenThamSo())
                .giaTri(e.getGiaTri())
                .donVi(e.getDonVi())
                .build();
    }
}
