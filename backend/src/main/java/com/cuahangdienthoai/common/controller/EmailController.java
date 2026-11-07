package com.cuahangdienthoai.common.controller;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@Slf4j
public class EmailController {

    @Data
    public static class SendOtpRequest {
        private String email;
        private String otpCode;
        private String purpose;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody SendOtpRequest request) {
        log.info("Yêu cầu gửi OTP: email={}, otpCode={}, purpose={}", request.getEmail(), request.getOtpCode(), request.getPurpose());
        
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("email", request.getEmail());
        resp.put("otpCode", request.getOtpCode());
        resp.put("message", "Mã xác thực OTP đã được gửi thành công đến email: " + request.getEmail());
        resp.put("isSimulated", true);

        return ResponseEntity.ok(resp);
    }
}
