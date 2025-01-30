package lv.degra.accounting.usermanager.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Base64;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import lv.degra.accounting.usermanager.service.AuthService;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private JwtDecoder jwtDecoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        jwtDecoder = mock(JwtDecoder.class);
        authService = mock(AuthService.class);
        jwtTokenProvider = new JwtTokenProvider(jwtDecoder, authService);
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
}
