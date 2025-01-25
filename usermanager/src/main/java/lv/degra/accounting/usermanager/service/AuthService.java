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
import lv.degra.accounting.core.user.exception.UserSaveException;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.model.UserRepository;
import lv.degra.accounting.usermanager.client.KeycloakProperties;
import lv.degra.accounting.usermanager.client.KeycloakTokenClient;

@Service
@Slf4j
public class AuthService {

	private final KeycloakTokenClient keycloakTokenClient;
	private final KeycloakProperties keycloakProperties;
	private final UserRepository userRepository;

	@Autowired
	public AuthService(KeycloakTokenClient keycloakTokenClient, KeycloakProperties keycloakProperties, UserRepository userRepository) {
		this.keycloakTokenClient = keycloakTokenClient;
		this.keycloakProperties = keycloakProperties;
		this.userRepository = userRepository;
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
			String sub = extractSub(tokenResponse.get("access_token").toString());
			String refreshToken = tokenResponse.get("refresh_token").toString();

			saveOrUpdateUser(sub, refreshToken);

			response.put("access_token", tokenResponse.get("access_token"));
			response.put("expires_in", tokenResponse.get("expires_in"));
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

	private String extractSub(String accessToken) {
		String[] parts = accessToken.split("\\.");
		if (parts.length != 3) {
			throw new KeycloakIntegrationException("Invalid token format", "TOKEN_ERROR");
		}
		try {
			String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));

			int subStart = payload.indexOf("\"sub\":\"") + 7;
			int subEnd = payload.indexOf("\"", subStart);
			return payload.substring(subStart, subEnd);
		} catch (Exception e) {
			throw new KeycloakIntegrationException("Failed to extract sub from token", "TOKEN_ERROR");
		}
	}

	private void saveOrUpdateUser(String userId, String refreshToken) {
		try {
			User user = userRepository.findByUserId(userId)
					.orElse(new User());
			user.setUserId(userId);
			user.setRefreshToken(refreshToken);
			userRepository.save(user);
		} catch (Exception e) {
			log.error("Neizdevās saglabāt lietotāja informāciju: {}", e.getMessage());
			throw new UserSaveException("Neizdevās saglabāt lietotāja informāciju", "USER_SAVE_ERROR");
		}
	}
}
