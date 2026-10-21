package com.cuahangdienthoai.warranty;

import com.cuahangdienthoai.common.entity.ThamSo;
import com.cuahangdienthoai.common.repository.ThamSoRepository;
import com.cuahangdienthoai.common.security.CurrentUser;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.order.entity.ChiTietHoaDon;
import com.cuahangdienthoai.order.entity.HoaDon;
import com.cuahangdienthoai.order.repository.ChiTietHoaDonRepository;
import com.cuahangdienthoai.order.repository.HoaDonRepository;
import com.cuahangdienthoai.supplier.entity.Imei;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import com.cuahangdienthoai.warranty.dto.TraHangDTO;
import com.cuahangdienthoai.warranty.entity.TraHang;
import com.cuahangdienthoai.warranty.repository.TraHangRepository;
import com.cuahangdienthoai.warranty.service.TraHangService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TraHangServiceTest {

    @Mock
    private TraHangRepository traHangRepository;

    @Mock
    private HoaDonRepository hoaDonRepository;

    @Mock
    private ChiTietHoaDonRepository chiTietHoaDonRepository;

    @Mock
    private ImeiRepository imeiRepository;

    @Mock
    private ThamSoRepository thamSoRepository;

    @Mock
    private CurrentUser currentUser;

    @Mock
    private com.cuahangdienthoai.common.CodeGenerator codeGenerator;

    @InjectMocks
    private TraHangService traHangService;

    @Test
    @DisplayName("3.3: Quá hạn đổi trả HAN_DOITRA_NGAY -> lỗi")
    void testReturnExpiredThrows() {
        HoaDon hd = HoaDon.builder()
                .soHD("HD0001")
                .ngayLap(LocalDateTime.now().minusDays(35)) // 35 ngày trước
                .build();
        when(hoaDonRepository.findById("HD0001")).thenReturn(Optional.of(hd));

        ThamSo ts = ThamSo.builder()
                .maThamSo("HAN_DOITRA_NGAY")
                .giaTri(BigDecimal.valueOf(30))
                .build();
        when(thamSoRepository.findById("HAN_DOITRA_NGAY")).thenReturn(Optional.of(ts));

        TraHangDTO dto = TraHangDTO.builder()
                .soHD("HD0001")
                .soIMEI("123456789012345")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                traHangService.create(dto)
        );
        assertTrue(ex.getMessage().contains("Đã quá thời hạn đổi trả"));
    }

    @Test
    @DisplayName("3.3: IMEI không thuộc hóa đơn -> lỗi")
    void testImeiNotInInvoiceThrows() {
        HoaDon hd = HoaDon.builder()
                .soHD("HD0001")
                .ngayLap(LocalDateTime.now().minusDays(5))
                .build();
        when(hoaDonRepository.findById("HD0001")).thenReturn(Optional.of(hd));
        when(thamSoRepository.findById("HAN_DOITRA_NGAY")).thenReturn(Optional.empty());

        Imei imeiCanTra = Imei.builder()
                .maIMEI("IM001")
                .soIMEI("123456789012345")
                .trangThai("da_ban")
                .build();
        when(imeiRepository.findBySoIMEI("123456789012345")).thenReturn(Optional.of(imeiCanTra));

        // Hóa đơn chỉ có IMEI khác ("IM999")
        Imei imeiKhac = Imei.builder().maIMEI("IM999").build();
        ChiTietHoaDon cthd = ChiTietHoaDon.builder().imei(imeiKhac).build();
        when(chiTietHoaDonRepository.findByHoaDonSoHD("HD0001")).thenReturn(List.of(cthd));

        TraHangDTO dto = TraHangDTO.builder()
                .soHD("HD0001")
                .soIMEI("123456789012345")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                traHangService.create(dto)
        );
        assertTrue(ex.getMessage().contains("không thuộc hóa đơn HD0001"));
    }

    @Test
    @DisplayName("3.3: IMEI đã được lập phiếu đổi trả trước đó -> lỗi")
    void testImeiAlreadyReturnedThrows() {
        HoaDon hd = HoaDon.builder()
                .soHD("HD0001")
                .ngayLap(LocalDateTime.now().minusDays(5))
                .build();
        when(hoaDonRepository.findById("HD0001")).thenReturn(Optional.of(hd));
        when(thamSoRepository.findById("HAN_DOITRA_NGAY")).thenReturn(Optional.empty());

        Imei imei = Imei.builder()
                .maIMEI("IM001")
                .soIMEI("123456789012345")
                .trangThai("da_ban")
                .build();
        when(imeiRepository.findBySoIMEI("123456789012345")).thenReturn(Optional.of(imei));

        ChiTietHoaDon cthd = ChiTietHoaDon.builder().imei(imei).build();
        when(chiTietHoaDonRepository.findByHoaDonSoHD("HD0001")).thenReturn(List.of(cthd));

        // Đã có phiếu đổi trả trước đó
        when(traHangRepository.findByImeiMaIMEI("IM001")).thenReturn(Optional.of(new TraHang()));

        TraHangDTO dto = TraHangDTO.builder()
                .soHD("HD0001")
                .soIMEI("123456789012345")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                traHangService.create(dto)
        );
        assertTrue(ex.getMessage().contains("đã được lập phiếu đổi trả trước đó"));
    }

    @Test
    @DisplayName("3.3: Đổi trả hợp lệ -> thành công, cập nhật trạng thái IMEI sang tra_hang")
    void testReturnSuccess() {
        HoaDon hd = HoaDon.builder()
                .soHD("HD0001")
                .ngayLap(LocalDateTime.now().minusDays(5))
                .build();
        when(hoaDonRepository.findById("HD0001")).thenReturn(Optional.of(hd));
        when(thamSoRepository.findById("HAN_DOITRA_NGAY")).thenReturn(Optional.empty());

        Imei imei = Imei.builder()
                .maIMEI("IM001")
                .soIMEI("123456789012345")
                .trangThai("da_ban")
                .build();
        when(imeiRepository.findBySoIMEI("123456789012345")).thenReturn(Optional.of(imei));

        ChiTietHoaDon cthd = ChiTietHoaDon.builder().imei(imei).build();
        when(chiTietHoaDonRepository.findByHoaDonSoHD("HD0001")).thenReturn(List.of(cthd));

        when(traHangRepository.findByImeiMaIMEI("IM001")).thenReturn(Optional.empty());

        NhanVien nv = NhanVien.builder().maNV("NV002").hoTen("Trần Thị Thu Ngân").build();
        when(currentUser.getCurrentNhanVien()).thenReturn(nv);
        when(codeGenerator.generateNextMaTR()).thenReturn("TR00001");

        when(traHangRepository.save(any(TraHang.class))).thenAnswer(i -> i.getArgument(0));

        TraHangDTO dto = TraHangDTO.builder()
                .soHD("HD0001")
                .soIMEI("123456789012345")
                .hinhThucHoanTien("tien_mat")
                .build();

        TraHangDTO result = traHangService.create(dto);
        assertNotNull(result);
        assertEquals("tra_hang", imei.getTrangThai());
        assertEquals("NV002", result.getMaNV());
        assertEquals("Trần Thị Thu Ngân", result.getTenNhanVien());
    }
}
