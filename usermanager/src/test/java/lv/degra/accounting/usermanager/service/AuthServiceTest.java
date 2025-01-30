package lv.degra.accounting.usermanager.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.util.MultiValueMap;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.model.UserRepository;
import lv.degra.accounting.usermanager.client.KeycloakProperties;
import lv.degra.accounting.usermanager.client.KeycloakTokenClient;

class AuthServiceTest {

    private KeycloakTokenClient tokenClientMock;
    private KeycloakProperties keycloakPropertiesMock;
    private AuthService authService;
    private UserRepository userRepositoryMock;
    private JwtDecoder jwtDecoderMock;
    private MeterRegistry meterRegistry;

    @BeforeEach
    void setUp() {
        tokenClientMock = mock(KeycloakTokenClient.class);
        keycloakPropertiesMock = mock(KeycloakProperties.class);
        userRepositoryMock = mock(UserRepository.class);
        jwtDecoderMock = mock(JwtDecoder.class);
        meterRegistry = new SimpleMeterRegistry();

        when(keycloakPropertiesMock.getClientId()).thenReturn("test-client");
        when(keycloakPropertiesMock.getClientSecret()).thenReturn("test-secret");

        // Mock JWT decoder
        Jwt mockJwt = mock(Jwt.class);
        when(mockJwt.getExpiresAt()).thenReturn(Instant.now().plusSeconds(3600));
        when(mockJwt.getSubject()).thenReturn("test-subject");
        when(jwtDecoderMock.decode(anyString())).thenReturn(mockJwt);

        authService = new AuthService(tokenClientMock, keycloakPropertiesMock, userRepositoryMock, jwtDecoderMock, meterRegistry);
    }

	@Test
	void testConstructor() {
		// Assert
		assertNotNull(authService, "AuthService instance should be created successfully");
	}

    @Test
    void testGetAccessToken_Success() {
        // Arrange
        Map<String, Object> mockResponse = Map.of("access_token", "test-token");
        when(tokenClientMock.getAccessToken(eq(MediaType.APPLICATION_FORM_URLENCODED_VALUE), any(MultiValueMap.class)))
                .thenReturn(mockResponse);

        // Act
        String accessToken = authService.getAccessToken();

        // Assert
        assertEquals("test-token", accessToken, "Access token should match the response token");
        verify(jwtDecoderMock).decode("test-token");

        // Capture and verify the request
        ArgumentCaptor<MultiValueMap<String, String>> captor = ArgumentCaptor.forClass(MultiValueMap.class);
        verify(tokenClientMock).getAccessToken(eq(MediaType.APPLICATION_FORM_URLENCODED_VALUE), captor.capture());

        MultiValueMap<String, String> capturedRequest = captor.getValue();
        assertEquals("client_credentials", capturedRequest.getFirst("grant_type"), "Grant type should be client_credentials");
        assertEquals("test-client", capturedRequest.getFirst("client_id"), "Client ID should match the properties");
        assertEquals("test-secret", capturedRequest.getFirst("client_secret"), "Client secret should match the properties");
    }

	@Test
	void testGetAccessToken_Failure() {
		// Arrange
		when(tokenClientMock.getAccessToken(anyString(), any(MultiValueMap.class)))
				.thenThrow(new RuntimeException("Keycloak is unavailable"));

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class, authService::getAccessToken);
		assertEquals("Authentication error", exception.getMessage(), "Exception message should match");
		assertEquals("AUTH_ERROR", exception.getErrorCode(), "Exception error code should match");
	}
}
