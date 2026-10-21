package com.cuahangdienthoai.common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CodeGeneratorTest {

    private final CodeGenerator codeGenerator = new CodeGenerator(
            null, null, null, null, null, null, null, null
    );

    @Test
    @DisplayName("3.6: Sinh mã đầu tiên khi chưa có dữ liệu (maxCode = null)")
    void testGenerateFirstCode() {
        assertEquals("KH0001", codeGenerator.generateNextCode(null, "KH", 4));
        assertEquals("DH000001", codeGenerator.generateNextCode(null, "DH", 6));
        assertEquals("PN001", codeGenerator.generateNextCode(null, "PN", 3));
        assertEquals("TR00001", codeGenerator.generateNextCode(null, "TR", 5));
        assertEquals("TN00001", codeGenerator.generateNextCode(null, "TN", 5));
        assertEquals("IMEI001", codeGenerator.generateNextCode(null, "IMEI", 3));
        assertEquals("HD000001", codeGenerator.generateNextCode(null, "HD", 6));
        assertEquals("BH000001", codeGenerator.generateNextCode(null, "BH", 6));
    }

    @Test
    @DisplayName("3.6: Sinh mã liên tiếp không trùng")
    void testGenerateSequentialCodes() {
        String code1 = codeGenerator.generateNextCode(null, "DH", 6);
        assertEquals("DH000001", code1);

        String code2 = codeGenerator.generateNextCode(code1, "DH", 6);
        assertEquals("DH000002", code2);

        String code3 = codeGenerator.generateNextCode(code2, "DH", 6);
        assertEquals("DH000003", code3);
    }

    @Test
    @DisplayName("3.6: Tiếp tục đúng sau khi mã giữa chừng bị xóa (maxCode là DH000003 dù DH000002 bị xóa)")
    void testContinueCorrectlyAfterIntermediateCodeDeleted() {
        // Giả sử có DH000001, DH000002, DH000003
        // Người dùng xóa DH000002
        // Danh sách còn: [DH000001, DH000003] -> Mã lớn nhất là DH000003
        String maxRemaining = "DH000003";

        String nextCode = codeGenerator.generateNextCode(maxRemaining, "DH", 6);

        // Mã tiếp theo phải là DH000004, tuyệt đối không được là DH000003 hay DH000002
        assertEquals("DH000004", nextCode);
    }

    @Test
    @DisplayName("3.6: Cơ chế retry hoạt động khi gặp lỗi")
    void testRetryMechanism() {
        final int[] attempts = {0};
        String result = codeGenerator.executeWithRetry(() -> {
            attempts[0]++;
            if (attempts[0] < 3) {
                throw new RuntimeException("Xung đột khóa chính tạm thời");
            }
            return "SUCCESS";
        });

        assertEquals("SUCCESS", result);
        assertEquals(3, attempts[0]);
    }

    @Test
    @DisplayName("3.6: Retry ném ngoại lệ nếu quá 3 lần thất bại")
    void testRetryFailsAfterMaxAttempts() {
        assertThrows(RuntimeException.class, () ->
                codeGenerator.executeWithRetry(() -> {
                    throw new RuntimeException("Lỗi kéo dài");
                })
        );
    }
}
