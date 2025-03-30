package lv.degra.accounting.usermanager.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.util.ReflectionTestUtils;

import lv.degra.accounting.core.user.authorize.config.JwtTokenProvider;
import lv.degra.accounting.core.user.authorize.service.AuthService;

class JwtTokenProviderTest {

    @Mock
    private JwtDecoder jwtDecoder;
    
    @Mock
    private AuthService authService;
    
    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // No need to mock createJwtDecoder method as it's now injected
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtDecoder", jwtDecoder);
    }

    @Test
    void extractUserClaims_ValidToken() {
        // Arrange
        String token = "valid.token";
        String refreshToken = "refresh.token";
        Jwt jwt = mock(Jwt.class);
        Map<String, Object> claims = Map.of("sub", "user123", "email", "test@example.com");
        
        when(jwtDecoder.decode(token)).thenReturn(jwt);
        when(jwt.getClaims()).thenReturn(claims);

        // Act
        Map<String, Object> result = jwtTokenProvider.extractUserClaims(token, refreshToken);

        // Assert
        assertNotNull(result);
        assertEquals("user123", result.get("sub"));
        assertEquals("test@example.com", result.get("email"));
        verify(jwtDecoder).decode(token);
    }

    @Test
    void extractUserClaims_ExpiredToken_RefreshSuccess() {
        // Arrange
        String token = "expired.token";
        String refreshToken = "refresh.token";
        String newToken = "new.token";
        Jwt newJwt = mock(Jwt.class);
        Map<String, Object> claims = Map.of("sub", "user123", "email", "test@example.com");
        Map<String, Object> tokenResponse = Map.of("access_token", newToken);

        when(jwtDecoder.decode(token))
            .thenThrow(new JwtException("Token has expired"));
        when(authService.refreshTokenIfExpired(refreshToken))
            .thenReturn(tokenResponse);
        when(jwtDecoder.decode(newToken)).thenReturn(newJwt);
        when(newJwt.getClaims()).thenReturn(claims);

        // Act
        Map<String, Object> result = jwtTokenProvider.extractUserClaims(token, refreshToken);

        // Assert
        assertNotNull(result);
        assertEquals("user123", result.get("sub"));
        assertEquals("test@example.com", result.get("email"));
        verify(authService).refreshTokenIfExpired(refreshToken);
        verify(jwtDecoder).decode(newToken);
    }

    @Test
    void extractUserClaims_ExpiredToken_RefreshFails() {
        // Arrange
        String token = "expired.token";
        String refreshToken = "refresh.token";
        
        when(jwtDecoder.decode(token))
            .thenThrow(new JwtException("Token has expired"));
        when(authService.refreshTokenIfExpired(refreshToken))
            .thenThrow(new RuntimeException("Refresh failed"));

        // Act & Assert
        assertThrows(RuntimeException.class, 
            () -> jwtTokenProvider.extractUserClaims(token, refreshToken));
        verify(authService).refreshTokenIfExpired(refreshToken);
    }

    @Test
    void extractUserClaims_OtherJwtException() {
        // Arrange
        String token = "invalid.token";
        String refreshToken = "refresh.token";
        
        when(jwtDecoder.decode(token))
            .thenThrow(new JwtException("Invalid signature"));

        // Act & Assert
        assertThrows(JwtException.class, 
            () -> jwtTokenProvider.extractUserClaims(token, refreshToken));
        verify(authService, never()).refreshTokenIfExpired(anyString());
    }

    @Test
    void parseToken_ValidToken() {
        // Arrange
        String payload = "{\"sub\":\"user123\",\"email\":\"test@example.com\"}";
        String token = "header." + Base64.getUrlEncoder().encodeToString(payload.getBytes()) + ".signature";

        // Act
        Map<String, Object> result = jwtTokenProvider.parseToken(token);

        // Assert
        assertNotNull(result);
        assertEquals("user123", result.get("sub"));
        assertEquals("test@example.com", result.get("email"));
    }

    @Test
    void parseToken_InvalidFormat() {
        // Arrange
        String invalidToken = "invalid-token-format";

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
            () -> jwtTokenProvider.parseToken(invalidToken),
            "Invalid JWT token format");
    }

    @Test
    void parseToken_InvalidBase64() {
        // Arrange
        String invalidToken = "header.invalid-base64.signature";

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
            () -> jwtTokenProvider.parseToken(invalidToken));
    }

    @Test
    void parseToken_InvalidJson() {
        // Arrange
        String invalidPayload = "not-json-content";
        String token = "header." + Base64.getUrlEncoder().encodeToString(invalidPayload.getBytes()) + ".signature";

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
            () -> jwtTokenProvider.parseToken(token));
    }
    
    @Test
    void validateToken_ValidToken() {
        // Arrange
        String token = "valid.token";
        Jwt jwt = mock(Jwt.class);
        Instant futureTime = Instant.now().plusSeconds(3600);
        
        when(jwtDecoder.decode(token)).thenReturn(jwt);
        when(jwt.getExpiresAt()).thenReturn(futureTime);
        
        // Act & Assert - no exception should be thrown
        jwtTokenProvider.validateToken(token);
        verify(jwtDecoder).decode(token);
    }
    
    @Test
    void validateToken_ExpiredToken() {
        // Arrange
        String token = "expired.token";
        Jwt jwt = mock(Jwt.class);
        Instant pastTime = Instant.now().minusSeconds(3600);
        
        when(jwtDecoder.decode(token)).thenReturn(jwt);
        when(jwt.getExpiresAt()).thenReturn(pastTime);
        
        // Act & Assert
        assertThrows(JwtException.class, 
            () -> jwtTokenProvider.validateToken(token));
        verify(jwtDecoder).decode(token);
    }
    
    @Test
    void validateToken_InvalidToken() {
        // Arrange
        String token = "invalid.token";
        
        when(jwtDecoder.decode(token)).thenThrow(new JwtException("Invalid token"));
        
        // Act & Assert
        assertThrows(JwtException.class, 
            () -> jwtTokenProvider.validateToken(token));
        verify(jwtDecoder).decode(token);
    }
    
    @Test
    void refreshExpiredToken_ValidNonExpiredToken() {
        // Arrange
        String token = "valid.token";
        long futureTime = System.currentTimeMillis() / 1000 + 3600; // 1 hour in the future
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("exp", futureTime);
        
        // Mock parseToken to return our claims
        ReflectionTestUtils.setField(jwtTokenProvider, "objectMapper", new com.fasterxml.jackson.databind.ObjectMapper());
        
        // Create a token with future expiration
        String payload = "{\"exp\":" + futureTime + ",\"sub\":\"user123\"}";
        String validToken = "header." + Base64.getUrlEncoder().encodeToString(payload.getBytes()) + ".signature";
        
        // Act
        Map<String, Object> result = jwtTokenProvider.refreshExpiredToken(validToken);
        
        // Assert
        assertNull(result); // Should return null for non-expired tokens
        verify(authService, never()).refreshTokenIfExpired(any());
    }
    
    @Test
    void refreshExpiredToken_ExpiredToken() {
        // Arrange
        long pastTime = System.currentTimeMillis() / 1000 - 3600; // 1 hour in the past
        Map<String, Object> refreshResponse = Map.of(
            "access_token", "new.token",
            "expires_in", 3600,
            "token_type", "bearer"
        );
        
        // Create a token with past expiration
        String payload = "{\"exp\":" + pastTime + ",\"sub\":\"user123\"}";
        String expiredToken = "header." + Base64.getUrlEncoder().encodeToString(payload.getBytes()) + ".signature";
        
        when(authService.refreshTokenIfExpired(expiredToken)).thenReturn(refreshResponse);
        
        // Act
        Map<String, Object> result = jwtTokenProvider.refreshExpiredToken(expiredToken);
        
        // Assert
        assertNotNull(result);
        assertEquals("new.token", result.get("access_token"));
        assertEquals(3600, result.get("expires_in"));
        assertEquals("bearer", result.get("token_type"));
        verify(authService).refreshTokenIfExpired(expiredToken);
    }
    
    @Test
    void refreshExpiredToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalid-token";
        
        // Act & Assert
        assertThrows(JwtException.class, 
            () -> jwtTokenProvider.refreshExpiredToken(invalidToken));
        verify(authService, never()).refreshTokenIfExpired(any());
    }
}
