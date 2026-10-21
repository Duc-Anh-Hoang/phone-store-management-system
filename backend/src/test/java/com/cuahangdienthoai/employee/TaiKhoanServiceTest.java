package com.cuahangdienthoai.employee;

import com.cuahangdienthoai.employee.repository.NhanVienRepository;
import com.cuahangdienthoai.employee.repository.PhanQuyenRepository;
import com.cuahangdienthoai.employee.repository.TaiKhoanRepository;
import com.cuahangdienthoai.employee.service.TaiKhoanService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class TaiKhoanServiceTest {

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @Mock
    private NhanVienRepository nhanVienRepository;

    @Mock
    private PhanQuyenRepository phanQuyenRepository;

    @InjectMocks
    private TaiKhoanService taiKhoanService;

    @Test
    @DisplayName("M6: Tạo tài khoản với mật khẩu null hoặc rỗng -> ném IllegalArgumentException")
    void testCreateWithEmptyPassword() {
        assertThrows(IllegalArgumentException.class, () ->
                taiKhoanService.create("NV001", "BANHANG", "user1", "")
        );
        assertThrows(IllegalArgumentException.class, () ->
                taiKhoanService.create("NV001", "BANHANG", "user1", null)
        );
    }

    @Test
    @DisplayName("M6: Tạo tài khoản với mật khẩu dưới 6 ký tự -> ném IllegalArgumentException")
    void testCreateWithShortPassword() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                taiKhoanService.create("NV001", "BANHANG", "user1", "12345")
        );
        assertTrue(ex.getMessage().contains("ít nhất 6 ký tự"));
    }
}
