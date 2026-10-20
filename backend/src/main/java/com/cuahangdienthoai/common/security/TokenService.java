package com.cuahangdienthoai.common.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {

    @Getter
    @AllArgsConstructor
    public static class TokenInfo {
        private String username;
        private String role;
        private LocalDateTime expiresAt;
    }

    private final Map<String, TokenInfo> tokenStore = new ConcurrentHashMap<>();

    public String createToken(String username, String role) {
        String token = "AUTH-" + UUID.randomUUID().toString().replace("-", "");
        tokenStore.put(token, new TokenInfo(username, role != null ? role.toUpperCase() : "STAFF", LocalDateTime.now().plusDays(1)));
        return token;
    }

    public TokenInfo getTokenInfo(String token) {
        if (token == null || token.trim().isEmpty()) return null;
        TokenInfo info = tokenStore.get(token.trim());
        if (info != null && info.getExpiresAt().isAfter(LocalDateTime.now())) {
            return info;
        }
        return null;
    }

    public void removeToken(String token) {
        if (token != null) tokenStore.remove(token);
    }
}
