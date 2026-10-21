package com.cuahangdienthoai.common.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;

class RoleAuthorizationInterceptorTest {

    private TokenService tokenService;
    private RoleAuthorizationInterceptor interceptor;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService();
        interceptor = new RoleAuthorizationInterceptor(tokenService);
    }

    @Test
    @DisplayName("Public endpoints (GET mathang, POST orders, login) không cần token")
    void testPublicEndpointsAllowWithoutToken() throws Exception {
        // GET /api/mathang
        MockHttpServletRequest req1 = new MockHttpServletRequest("GET", "/api/mathang");
        MockHttpServletResponse res1 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req1, res1, new Object()));

        // POST /api/orders
        MockHttpServletRequest req2 = new MockHttpServletRequest("POST", "/api/orders");
        MockHttpServletResponse res2 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req2, res2, new Object()));

        // POST /api/auth/login
        MockHttpServletRequest req3 = new MockHttpServletRequest("POST", "/api/auth/login");
        MockHttpServletResponse res3 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req3, res3, new Object()));

        // GET /api/orders/phone/0987654321
        MockHttpServletRequest req4 = new MockHttpServletRequest("GET", "/api/orders/phone/0987654321");
        MockHttpServletResponse res4 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req4, res4, new Object()));
    }

    @Test
    @DisplayName("Không có token gọi API bảo mật /api/khachhang/sdt/... phải trả về 401")
    void testMissingTokenReturns401() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/khachhang/sdt/0987654321");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(request, response, new Object());

        assertFalse(result);
        assertEquals(401, response.getStatus());
        assertTrue(response.getContentAsString().contains("Chưa đăng nhập"));
    }

    @Test
    @DisplayName("Token không hợp lệ hoặc hết hạn phải trả về 401")
    void testInvalidTokenReturns401() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/khachhang/sdt/0987654321");
        request.addHeader("Authorization", "Bearer INVALID_OR_EXPIRED_TOKEN");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(request, response, new Object());

        assertFalse(result);
        assertEquals(401, response.getStatus());
        assertTrue(response.getContentAsString().contains("hết hạn hoặc không hợp lệ"));
    }

    @Test
    @DisplayName("CUSTOMER truy cập thông tin chính mình thành công, truy cập người khác trả về 403")
    void testCustomerOwnDataAndOtherData() throws Exception {
        String token = tokenService.createToken("0987654321", "CUSTOMER", "KH001");

        // Xem SĐT chính mình -> 200 (true)
        MockHttpServletRequest req1 = new MockHttpServletRequest("GET", "/api/khachhang/sdt/0987654321");
        req1.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res1 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req1, res1, new Object()));

        // Xem hóa đơn chính mình -> 200 (true)
        MockHttpServletRequest req2 = new MockHttpServletRequest("GET", "/api/hoadon/khachhang/KH001");
        req2.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res2 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req2, res2, new Object()));

        // Xem SĐT người khác -> 403
        MockHttpServletRequest req3 = new MockHttpServletRequest("GET", "/api/khachhang/sdt/0912345678");
        req3.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res3 = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(req3, res3, new Object()));
        assertEquals(403, res3.getStatus());

        // Xem hóa đơn người khác -> 403
        MockHttpServletRequest req4 = new MockHttpServletRequest("GET", "/api/hoadon/khachhang/KH999");
        req4.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res4 = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(req4, res4, new Object()));
        assertEquals(403, res4.getStatus());
    }

    @Test
    @DisplayName("CUSTOMER tuyệt đối không vào được các API quản trị")
    void testCustomerCannotAccessAdminApis() throws Exception {
        String token = tokenService.createToken("0987654321", "CUSTOMER", "KH001");

        String[] adminUris = {
                "/api/nhanvien",
                "/api/donhangonline",
                "/api/phieunhap",
                "/api/dashboard",
                "/api/taikhoan",
                "/api/trahang"
        };

        for (String uri : adminUris) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", uri);
            req.addHeader("Authorization", "Bearer " + token);
            MockHttpServletResponse res = new MockHttpServletResponse();

            assertFalse(interceptor.preHandle(req, res, new Object()), "CUSTOMER không được vào " + uri);
            assertEquals(403, res.getStatus());
        }
    }

    @Test
    @DisplayName("M3: THUNGAN truy cập đúng quyền (hoadon, trahang, donhangonline, GET nhanvien)")
    void testThuNganPermissions() throws Exception {
        String token = tokenService.createToken("thungan", "THUNGAN");

        // /api/donhangonline -> OK
        MockHttpServletRequest req1 = new MockHttpServletRequest("GET", "/api/donhangonline");
        req1.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res1 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req1, res1, new Object()));

        // /api/trahang -> OK
        MockHttpServletRequest req2 = new MockHttpServletRequest("GET", "/api/trahang");
        req2.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res2 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req2, res2, new Object()));

        // GET /api/nhanvien -> OK
        MockHttpServletRequest req3 = new MockHttpServletRequest("GET", "/api/nhanvien");
        req3.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res3 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req3, res3, new Object()));

        // POST /api/nhanvien -> 403 (chỉ QUANLY/ADMIN)
        MockHttpServletRequest req4 = new MockHttpServletRequest("POST", "/api/nhanvien");
        req4.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res4 = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(req4, res4, new Object()));
        assertEquals(403, res4.getStatus());

        // /api/phieunhap -> 403 (chỉ KHO, QUANLY, ADMIN)
        MockHttpServletRequest req5 = new MockHttpServletRequest("GET", "/api/phieunhap");
        req5.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res5 = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(req5, res5, new Object()));
        assertEquals(403, res5.getStatus());
    }

    @Test
    @DisplayName("M3: KYTHUAT truy cập GET /api/hoadon/{soHD} và bảo hành, không vào được trahang hay phieunhap")
    void testKyThuatPermissions() throws Exception {
        String token = tokenService.createToken("kythuat", "KYTHUAT");

        // GET /api/hoadon/HD0001 -> OK (M3.c)
        MockHttpServletRequest req1 = new MockHttpServletRequest("GET", "/api/hoadon/HD0001");
        req1.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res1 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req1, res1, new Object()));

        // GET /api/baohanh -> OK
        MockHttpServletRequest req2 = new MockHttpServletRequest("GET", "/api/baohanh");
        req2.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res2 = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(req2, res2, new Object()));

        // GET /api/trahang -> 403
        MockHttpServletRequest req3 = new MockHttpServletRequest("GET", "/api/trahang");
        req3.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse res3 = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(req3, res3, new Object()));
        assertEquals(403, res3.getStatus());
    }

    @Test
    @DisplayName("ADMIN và QUANLY có toàn quyền mọi API")
    void testAdminAndQuanLyPermissions() throws Exception {
        String adminToken = tokenService.createToken("admin", "ADMIN");
        String quanlyToken = tokenService.createToken("quanly", "QUANLY");

        String[] testUris = {"/api/nhanvien", "/api/taikhoan", "/api/phieunhap", "/api/trahang", "/api/donhangonline"};

        for (String uri : testUris) {
            MockHttpServletRequest reqA = new MockHttpServletRequest("POST", uri);
            reqA.addHeader("Authorization", "Bearer " + adminToken);
            MockHttpServletResponse resA = new MockHttpServletResponse();
            assertTrue(interceptor.preHandle(reqA, resA, new Object()), "ADMIN phải được vào " + uri);

            MockHttpServletRequest reqQ = new MockHttpServletRequest("POST", uri);
            reqQ.addHeader("Authorization", "Bearer " + quanlyToken);
            MockHttpServletResponse resQ = new MockHttpServletResponse();
            assertTrue(interceptor.preHandle(reqQ, resQ, new Object()), "QUANLY phải được vào " + uri);
        }
    }
}
