package lv.degra.accounting.core.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;

import lv.degra.accounting.core.user.client.KeycloakProperties;
import lv.degra.accounting.core.user.client.KeycloakTokenClient;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;

class KeycloakAuthServiceTest {

	private KeycloakTokenClient tokenClientMock;
	private KeycloakProperties keycloakPropertiesMock;
	private KeycloakAuthService authService;

	@BeforeEach
	void setUp() {
		tokenClientMock = mock(KeycloakTokenClient.class);
		keycloakPropertiesMock = mock(KeycloakProperties.class);

		when(keycloakPropertiesMock.getClientId()).thenReturn("test-client");
		when(keycloakPropertiesMock.getClientSecret()).thenReturn("test-secret");

		authService = new KeycloakAuthService(tokenClientMock, keycloakPropertiesMock);
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
