package lv.degra.accounting.usermanager.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.usermanager.client.KeycloakProperties;
import lv.degra.accounting.usermanager.client.KeycloakTokenClient;

@Service
@Slf4j
public class AuthService {

	private final KeycloakTokenClient keycloakTokenClient;
	private final KeycloakProperties keycloakProperties;

	@Autowired
	public AuthService(KeycloakTokenClient keycloakTokenClient, KeycloakProperties keycloakProperties) {
		this.keycloakTokenClient = keycloakTokenClient;
		this.keycloakProperties = keycloakProperties;
	}

	@Cacheable("keycloakTokens")
	public String getAccessToken() {
		MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
		request.add("grant_type", "client_credentials");
		request.add("client_id", keycloakProperties.getClientId());
		request.add("client_secret", keycloakProperties.getClientSecret());

		try {
			Map<String, Object> response = keycloakTokenClient.getAccessToken(MediaType.APPLICATION_FORM_URLENCODED_VALUE, request);
			return (String) response.get("access_token");
		} catch (Exception e) {
			log.error("Unable to get access token no Keycloak: {}", e.getMessage());
			throw new KeycloakIntegrationException("Authentication error", "AUTH_ERROR");
		}
	}

	public Map<String, Object> login(String email, String password) {
		MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
		request.add("grant_type", "password");
		request.add("client_id", keycloakProperties.getClientId());
		request.add("client_secret", keycloakProperties.getClientSecret());
		request.add("username", email);
		request.add("password", password);

		Map<String, Object> response = new HashMap<>();

		try {
			Map<String, Object> tokenResponse = keycloakTokenClient.getAccessToken(MediaType.APPLICATION_JSON_VALUE, request);
			response.put("access_token", tokenResponse.get("access_token"));
			response.put("expires_in", tokenResponse.get("expires_in"));
			response.put("refresh_token", tokenResponse.get("refresh_token")); // Ja nepieciešams
			response.put("token_type", tokenResponse.get("token_type"));
			return response;
		} catch (Exception e) {
			log.error("Neizdevās autentificēt lietotāju ar e-pastu: {}", email, e);
			throw new KeycloakIntegrationException("Invalid credentials", "AUTH_ERROR");
		}
	}

	public void logout(String refreshToken) {
		MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
		request.add("client_id", keycloakProperties.getClientId());
		request.add("client_secret", keycloakProperties.getClientSecret());
		request.add("refresh_token", refreshToken);

		try {
			keycloakTokenClient.logout(MediaType.APPLICATION_FORM_URLENCODED_VALUE, request);
		} catch (Exception e) {
			log.error("Neizdevās izrakstīt lietotāju", e);
			throw new KeycloakIntegrationException("Logout failed", "LOGOUT_ERROR");
		}
	}

	public String refreshTokenIfExpired(String refreshToken) {
		try {
			Map<String, Object> tokenResponse = keycloakTokenClient.getAccessToken("application/x-www-form-urlencoded",
					createRefreshRequest(refreshToken));
			return (String) tokenResponse.get("access_token");
		} catch (Exception e) {
			throw new RuntimeException("Unable to refresh token: " + e.getMessage(), e);
		}
	}

	private MultiValueMap<String, String> createRefreshRequest(String refreshToken) {
		MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
		request.add("grant_type", "refresh_token");
		request.add("client_id", keycloakProperties.getClientId());
		request.add("client_secret", keycloakProperties.getClientSecret());
		request.add("refresh_token", refreshToken);
		return request;
	}

}