package lv.degra.accounting.core.user.authorize.config;

import java.io.IOException;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.user.authorize.service.AuthService;

@Service
@Slf4j
public class JwtTokenProvider {

    private final JwtDecoder jwtDecoder;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @Autowired
    public JwtTokenProvider(JwtDecoder jwtDecoder, AuthService authService) {
        this.jwtDecoder = jwtDecoder;
        this.authService = authService;
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> extractUserClaims(String token, String refreshToken) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return jwt.getClaims();
        } catch (JwtException e) {
            if (e.getMessage().contains("expired")) {
                return handleExpiredToken(refreshToken);
            } else {
                throw e;
            }
        }
    }

    private Map<String, Object> handleExpiredToken(String refreshToken) {
        Map<String, Object> tokenResponse = authService.refreshTokenIfExpired(refreshToken);
        try {
            String newToken = (String) tokenResponse.get("access_token");
            Jwt refreshedJwt = jwtDecoder.decode(newToken);
            return refreshedJwt.getClaims();
        } catch (JwtException ex) {
            throw new RuntimeException("Failed to decode refreshed token: " + ex.getMessage(), ex);
        }
    }

    public void validateToken(String token) throws JwtException {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            if (jwt.getExpiresAt() != null && jwt.getExpiresAt().isBefore(Instant.now())) {
                throw new JwtException("Token has expired");
            }
        } catch (Exception e) {
            throw new JwtException("Invalid token: " + e.getMessage());
        }
    }

    public Map<String, Object> refreshExpiredToken(String token) {
        try {
            Map<String, Object> claims = parseToken(token);
            long exp = ((Number) claims.get("exp")).longValue();
            if (exp * 1000 < System.currentTimeMillis()) {
                return authService.refreshTokenIfExpired(token);
            }
            return null; // Token is still valid
        } catch (Exception e) {
            log.error("Error checking token expiration: {}", e.getMessage());
            throw new JwtException("Invalid token format", e);
        }
    }

    public Map<String, Object> parseToken(String token) {
        try {
            String[] chunks = token.split("\\.");
            if (chunks.length < 2) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }

            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));
            return objectMapper.readValue(payload, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid JWT token", e);
        }
    }
}
