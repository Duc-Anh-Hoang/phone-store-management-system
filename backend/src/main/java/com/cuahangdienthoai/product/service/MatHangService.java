package com.cuahangdienthoai.product.service;

import com.cuahangdienthoai.product.dto.MatHangDTO;
import com.cuahangdienthoai.product.entity.LoaiHang;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.entity.NhomHang;
import com.cuahangdienthoai.product.repository.LoaiHangRepository;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.product.repository.NhomHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatHangService {

    private final MatHangRepository matHangRepository;
    private final NhomHangRepository nhomHangRepository;
    private final LoaiHangRepository loaiHangRepository;

    public List<MatHangDTO> getAll() {
        return matHangRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MatHangDTO getById(String maHang) {
        return matHangRepository.findById(maHang)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + maHang));
    }

    public List<MatHangDTO> getByNhomHang(String maNhom) {
        return matHangRepository.findByNhomHangMaNhom(maNhom).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public MatHangDTO create(MatHangDTO dto) {
        NhomHang nhom = nhomHangRepository.findById(dto.getMaNhom())
                .orElseThrow(() -> new RuntimeException("Nhóm hàng không tồn tại: " + dto.getMaNhom()));
        LoaiHang loai = loaiHangRepository.findById(dto.getMaLoai())
                .orElseThrow(() -> new RuntimeException("Loại hàng không tồn tại: " + dto.getMaLoai()));
        MatHang entity = MatHang.builder()
                .maHang(dto.getMaHang()).tenHang(dto.getTenHang())
                .donGia(dto.getDonGia()).dvt(dto.getDvt())
                .nhomHang(nhom).loaiHang(loai)
                .quanLyImei(dto.isQuanLyIMEI())
                .thoiHanBaoHanh(dto.getThoiHanBaoHanh())
                .build();
        return toDTO(matHangRepository.save(entity));
    }

    @Transactional
    public MatHangDTO update(String maHang, MatHangDTO dto) {
        MatHang entity = matHangRepository.findById(maHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + maHang));
        entity.setTenHang(dto.getTenHang());
        entity.setDonGia(dto.getDonGia());
        entity.setDvt(dto.getDvt());
        entity.setQuanLyImei(dto.isQuanLyIMEI());
        entity.setThoiHanBaoHanh(dto.getThoiHanBaoHanh());
        if (dto.getMaNhom() != null) {
            entity.setNhomHang(nhomHangRepository.findById(dto.getMaNhom())
                    .orElseThrow(() -> new RuntimeException("Nhóm hàng không tồn tại")));
        }
        if (dto.getMaLoai() != null) {
            entity.setLoaiHang(loaiHangRepository.findById(dto.getMaLoai())
                    .orElseThrow(() -> new RuntimeException("Loại hàng không tồn tại")));
        }
        return toDTO(matHangRepository.save(entity));
    }

    @Transactional
    public void delete(String maHang) {
        matHangRepository.deleteById(maHang);
    }

    private MatHangDTO toDTO(MatHang e) {
        return MatHangDTO.builder()
                .maHang(e.getMaHang()).tenHang(e.getTenHang())
                .donGia(e.getDonGia()).dvt(e.getDvt())
                .maNhom(e.getNhomHang().getMaNhom()).tenNhom(e.getNhomHang().getTenNhom())
                .maLoai(e.getLoaiHang().getMaLoai()).tenLoai(e.getLoaiHang().getTenLoai())
                .quanLyIMEI(e.isQuanLyImei()).thoiHanBaoHanh(e.getThoiHanBaoHanh())
                .build();
    }
}
