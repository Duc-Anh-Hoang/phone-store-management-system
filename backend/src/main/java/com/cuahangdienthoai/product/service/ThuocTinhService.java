package com.cuahangdienthoai.product.service;

import com.cuahangdienthoai.product.dto.ChiTietThuocTinhDTO;
import com.cuahangdienthoai.product.dto.ThuocTinhDTO;
import com.cuahangdienthoai.product.entity.ChiTietThuocTinh;
import com.cuahangdienthoai.product.entity.ChiTietThuocTinhId;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.entity.ThuocTinh;
import com.cuahangdienthoai.product.repository.ChiTietThuocTinhRepository;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.product.repository.ThuocTinhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThuocTinhService {

    private final ThuocTinhRepository thuocTinhRepository;
    private final ChiTietThuocTinhRepository chiTietThuocTinhRepository;
    private final MatHangRepository matHangRepository;

    public List<ThuocTinhDTO> getAll() {
        return thuocTinhRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ThuocTinhDTO getById(String maThuocTinh) {
        return thuocTinhRepository.findById(maThuocTinh)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thuộc tính: " + maThuocTinh));
    }

    @Transactional
    public ThuocTinhDTO create(ThuocTinhDTO dto) {
        ThuocTinh entity = ThuocTinh.builder()
                .maThuocTinh(dto.getMaThuocTinh())
                .tenThuocTinh(dto.getTenThuocTinh())
                .build();
        return toDTO(thuocTinhRepository.save(entity));
    }

    @Transactional
    public ThuocTinhDTO update(String maThuocTinh, ThuocTinhDTO dto) {
        ThuocTinh entity = thuocTinhRepository.findById(maThuocTinh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thuộc tính: " + maThuocTinh));
        entity.setTenThuocTinh(dto.getTenThuocTinh());
        return toDTO(thuocTinhRepository.save(entity));
    }

    @Transactional
    public void delete(String maThuocTinh) {
        thuocTinhRepository.deleteById(maThuocTinh);
    }

    public List<ChiTietThuocTinhDTO> getByMatHang(String maHang) {
        return chiTietThuocTinhRepository.findByIdMaHang(maHang).stream()
                .map(ct -> ChiTietThuocTinhDTO.builder()
                        .maHang(ct.getId().getMaHang())
                        .maThuocTinh(ct.getId().getMaThuocTinh())
                        .tenThuocTinh(ct.getThuocTinh() != null ? ct.getThuocTinh().getTenThuocTinh() : null)
                        .giaTri(ct.getGiaTri())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ChiTietThuocTinhDTO addChiTietThuocTinh(ChiTietThuocTinhDTO dto) {
        MatHang mh = matHangRepository.findById(dto.getMaHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + dto.getMaHang()));
        ThuocTinh tt = thuocTinhRepository.findById(dto.getMaThuocTinh())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thuộc tính: " + dto.getMaThuocTinh()));

        ChiTietThuocTinhId id = new ChiTietThuocTinhId(dto.getMaHang(), dto.getMaThuocTinh());
        ChiTietThuocTinh cttt = ChiTietThuocTinh.builder()
                .id(id)
                .matHang(mh)
                .thuocTinh(tt)
                .giaTri(dto.getGiaTri())
                .build();
        cttt = chiTietThuocTinhRepository.save(cttt);

        return ChiTietThuocTinhDTO.builder()
                .maHang(cttt.getId().getMaHang())
                .maThuocTinh(cttt.getId().getMaThuocTinh())
                .tenThuocTinh(tt.getTenThuocTinh())
                .giaTri(cttt.getGiaTri())
                .build();
    }

    @Transactional
    public void deleteChiTietThuocTinh(String maHang, String maThuocTinh) {
        ChiTietThuocTinhId id = new ChiTietThuocTinhId(maHang, maThuocTinh);
        chiTietThuocTinhRepository.deleteById(id);
    }

    private ThuocTinhDTO toDTO(ThuocTinh e) {
        return ThuocTinhDTO.builder()
                .maThuocTinh(e.getMaThuocTinh())
                .tenThuocTinh(e.getTenThuocTinh())
                .build();
    }
}
