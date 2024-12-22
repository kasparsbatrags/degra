package lv.degra.accounting.core.user.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.user.client.KeycloakProperties;
import lv.degra.accounting.core.user.client.KeycloakTokenClient;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;

@Service
@Slf4j
public class KeycloakAuthService {

	private final KeycloakTokenClient keycloakTokenClient;
	private final KeycloakProperties keycloakProperties;

	@Autowired
	public KeycloakAuthService(KeycloakTokenClient keycloakTokenClient, KeycloakProperties keycloakProperties) {
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
}