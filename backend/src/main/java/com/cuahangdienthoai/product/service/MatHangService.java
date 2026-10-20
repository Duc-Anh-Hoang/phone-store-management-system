package com.cuahangdienthoai.product.service;

import com.cuahangdienthoai.product.dto.MatHangDTO;
import com.cuahangdienthoai.product.dto.ThongSoDTO;
import com.cuahangdienthoai.product.entity.LoaiHang;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.entity.NhomHang;
import com.cuahangdienthoai.product.repository.ChiTietThuocTinhRepository;
import com.cuahangdienthoai.product.repository.LoaiHangRepository;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.product.repository.NhomHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatHangService {

    private final MatHangRepository matHangRepository;
    private final NhomHangRepository nhomHangRepository;
    private final LoaiHangRepository loaiHangRepository;
    private final ChiTietThuocTinhRepository chiTietThuocTinhRepository;

    private Map<String, Integer> loadTonKhoMap() {
        return matHangRepository.findAllTonKho().stream()
                .collect(Collectors.toMap(
                        p -> p.getMaHang(),
                        p -> p.getTonKho() != null ? p.getTonKho() : 0,
                        (existing, replacement) -> existing
                ));
    }

    public List<MatHangDTO> getAll() {
        Map<String, Integer> tonKhoMap = loadTonKhoMap();
        return matHangRepository.findAll().stream()
                .map(e -> toDTO(e, tonKhoMap))
                .collect(Collectors.toList());
    }

    public MatHangDTO getById(String maHang) {
        Map<String, Integer> tonKhoMap = loadTonKhoMap();
        return matHangRepository.findById(maHang)
                .map(e -> toDTO(e, tonKhoMap))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + maHang));
    }

    public List<MatHangDTO> getByNhomHang(String maNhom) {
        Map<String, Integer> tonKhoMap = loadTonKhoMap();
        return matHangRepository.findByNhomHangMaNhom(maNhom).stream()
                .map(e -> toDTO(e, tonKhoMap))
                .collect(Collectors.toList());
    }

    public List<ThongSoDTO> getThongSo(String maHang) {
        return chiTietThuocTinhRepository.findByIdMaHang(maHang).stream()
                .map(ct -> ThongSoDTO.builder()
                        .maThuocTinh(ct.getThuocTinh() != null ? ct.getThuocTinh().getMaThuocTinh() : null)
                        .tenThuocTinh(ct.getThuocTinh() != null ? ct.getThuocTinh().getTenThuocTinh() : null)
                        .giaTri(ct.getGiaTri())
                        .build())
                .collect(Collectors.toList());
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
        Map<String, Integer> tonKhoMap = loadTonKhoMap();
        return toDTO(matHangRepository.save(entity), tonKhoMap);
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
        Map<String, Integer> tonKhoMap = loadTonKhoMap();
        return toDTO(matHangRepository.save(entity), tonKhoMap);
    }

    @Transactional
    public void delete(String maHang) {
        matHangRepository.deleteById(maHang);
    }

    private MatHangDTO toDTO(MatHang e, Map<String, Integer> tonKhoMap) {
        return MatHangDTO.builder()
                .maHang(e.getMaHang()).tenHang(e.getTenHang())
                .donGia(e.getDonGia()).dvt(e.getDvt())
                .maNhom(e.getNhomHang().getMaNhom()).tenNhom(e.getNhomHang().getTenNhom())
                .maLoai(e.getLoaiHang().getMaLoai()).tenLoai(e.getLoaiHang().getTenLoai())
                .quanLyIMEI(e.isQuanLyImei()).thoiHanBaoHanh(e.getThoiHanBaoHanh())
                .tonKho(tonKhoMap.getOrDefault(e.getMaHang(), 0))
                .build();
    }
}
