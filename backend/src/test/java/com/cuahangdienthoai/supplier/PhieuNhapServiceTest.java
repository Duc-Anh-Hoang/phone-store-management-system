package com.cuahangdienthoai.supplier;

import com.cuahangdienthoai.common.CodeGenerator;
import com.cuahangdienthoai.common.security.CurrentUser;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.supplier.dto.ChiTietPhieuNhapDTO;
import com.cuahangdienthoai.supplier.dto.PhieuNhapDTO;
import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhap;
import com.cuahangdienthoai.supplier.entity.Imei;
import com.cuahangdienthoai.supplier.entity.NhaCungCap;
import com.cuahangdienthoai.supplier.entity.PhieuNhap;
import com.cuahangdienthoai.supplier.repository.ChiTietPhieuNhapRepository;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import com.cuahangdienthoai.supplier.repository.NhaCungCapRepository;
import com.cuahangdienthoai.supplier.repository.PhieuNhapRepository;
import com.cuahangdienthoai.supplier.service.PhieuNhapService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PhieuNhapServiceTest {

    @Mock
    private PhieuNhapRepository phieuNhapRepository;

    @Mock
    private ChiTietPhieuNhapRepository chiTietPhieuNhapRepository;

    @Mock
    private NhaCungCapRepository nhaCungCapRepository;

    @Mock
    private MatHangRepository matHangRepository;

    @Mock
    private ImeiRepository imeiRepository;

    @Mock
    private CurrentUser currentUser;

    @Mock
    private CodeGenerator codeGenerator;

    @InjectMocks
    private PhieuNhapService phieuNhapService;

    private NhaCungCap ncc;
    private NhanVien nv;
    private MatHang mhQuanLyImei;

    @BeforeEach
    void setUp() {
        ncc = NhaCungCap.builder().maNCC("NCC01").tenNCC("Apple VN").build();
        nv = NhanVien.builder().maNV("NV005").hoTen("Hoàng Thủ Kho").build();
        mhQuanLyImei = MatHang.builder()
                .maHang("MH001")
                .tenHang("iPhone 16 Pro Max")
                .quanLyImei(true)
                .build();
    }

    @Test
    @DisplayName("3.4: Số IMEI khác số lượng nhập -> báo lỗi 400")
    void testImeiCountMismatchThrows() {
        when(nhaCungCapRepository.findById("NCC01")).thenReturn(Optional.of(ncc));
        when(currentUser.getCurrentNhanVien()).thenReturn(nv);
        when(codeGenerator.generateNextSoPN()).thenReturn("PN001");
        when(phieuNhapRepository.save(any(PhieuNhap.class))).thenAnswer(i -> i.getArgument(0));
        when(matHangRepository.findById("MH001")).thenReturn(Optional.of(mhQuanLyImei));

        // Nhập 3 máy nhưng chỉ gửi 2 IMEI
        PhieuNhapDTO dto = PhieuNhapDTO.builder()
                .maNCC("NCC01")
                .chiTiet(List.of(
                        ChiTietPhieuNhapDTO.builder()
                                .maHang("MH001")
                                .slNhap(3)
                                .donGiaNhap(BigDecimal.valueOf(25000000))
                                .danhSachImei(List.of("111111111111111", "222222222222222"))
                                .build()
                ))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                phieuNhapService.create(dto)
        );
        assertTrue(ex.getMessage().contains("phải bằng số lượng nhập"));
    }

    @Test
    @DisplayName("3.4: Danh sách IMEI gửi lên bị trùng lặp -> báo lỗi 400")
    void testDuplicateImeiInPayloadThrows() {
        when(nhaCungCapRepository.findById("NCC01")).thenReturn(Optional.of(ncc));
        when(currentUser.getCurrentNhanVien()).thenReturn(nv);
        when(codeGenerator.generateNextSoPN()).thenReturn("PN001");
        when(phieuNhapRepository.save(any(PhieuNhap.class))).thenAnswer(i -> i.getArgument(0));
        when(matHangRepository.findById("MH001")).thenReturn(Optional.of(mhQuanLyImei));

        // Nhập 2 máy nhưng trùng số IMEI
        PhieuNhapDTO dto = PhieuNhapDTO.builder()
                .maNCC("NCC01")
                .chiTiet(List.of(
                        ChiTietPhieuNhapDTO.builder()
                                .maHang("MH001")
                                .slNhap(2)
                                .donGiaNhap(BigDecimal.valueOf(25000000))
                                .danhSachImei(List.of("351234567890123", "351234567890123"))
                                .build()
                ))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                phieuNhapService.create(dto)
        );
        assertTrue(ex.getMessage().contains("bị trùng lặp"));
    }

    @Test
    @DisplayName("3.4: IMEI sai định dạng (không phải 15 chữ số) -> báo lỗi 400")
    void testInvalidImeiFormatThrows() {
        when(nhaCungCapRepository.findById("NCC01")).thenReturn(Optional.of(ncc));
        when(currentUser.getCurrentNhanVien()).thenReturn(nv);
        when(codeGenerator.generateNextSoPN()).thenReturn("PN001");
        when(phieuNhapRepository.save(any(PhieuNhap.class))).thenAnswer(i -> i.getArgument(0));
        when(matHangRepository.findById("MH001")).thenReturn(Optional.of(mhQuanLyImei));

        // IMEI chỉ có 10 chữ số
        PhieuNhapDTO dto = PhieuNhapDTO.builder()
                .maNCC("NCC01")
                .chiTiet(List.of(
                        ChiTietPhieuNhapDTO.builder()
                                .maHang("MH001")
                                .slNhap(1)
                                .donGiaNhap(BigDecimal.valueOf(25000000))
                                .danhSachImei(List.of("1234567890"))
                                .build()
                ))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                phieuNhapService.create(dto)
        );
        assertTrue(ex.getMessage().contains("phải đúng 15 chữ số"));
    }

    @Test
    @DisplayName("3.4: Nhập 3 máy với 3 IMEI hợp lệ -> sinh đúng 3 dòng IMEI vào DB")
    void testValidThreeImeisSaved() {
        when(nhaCungCapRepository.findById("NCC01")).thenReturn(Optional.of(ncc));
        when(currentUser.getCurrentNhanVien()).thenReturn(nv);
        when(codeGenerator.generateNextSoPN()).thenReturn("PN001");
        when(phieuNhapRepository.save(any(PhieuNhap.class))).thenAnswer(i -> i.getArgument(0));
        when(matHangRepository.findById("MH001")).thenReturn(Optional.of(mhQuanLyImei));

        when(imeiRepository.findBySoIMEI(anyString())).thenReturn(Optional.empty());
        when(codeGenerator.generateNextMaIMEI()).thenReturn("IMEI001", "IMEI002", "IMEI003");

        List<Imei> savedImeis = new ArrayList<>();
        when(imeiRepository.save(any(Imei.class))).thenAnswer(i -> {
            Imei saved = i.getArgument(0);
            savedImeis.add(saved);
            return saved;
        });

        PhieuNhapDTO dto = PhieuNhapDTO.builder()
                .maNCC("NCC01")
                .chiTiet(List.of(
                        ChiTietPhieuNhapDTO.builder()
                                .maHang("MH001")
                                .slNhap(3)
                                .donGiaNhap(BigDecimal.valueOf(25000000))
                                .danhSachImei(List.of("351234567890121", "351234567890122", "351234567890123"))
                                .build()
                ))
                .build();

        PhieuNhapDTO result = phieuNhapService.create(dto);
        assertNotNull(result);
        assertEquals(3, savedImeis.size());
        assertEquals("351234567890121", savedImeis.get(0).getSoIMEI());
        assertEquals("351234567890122", savedImeis.get(1).getSoIMEI());
        assertEquals("351234567890123", savedImeis.get(2).getSoIMEI());
        assertEquals("con_hang", savedImeis.get(0).getTrangThai());
    }
}
