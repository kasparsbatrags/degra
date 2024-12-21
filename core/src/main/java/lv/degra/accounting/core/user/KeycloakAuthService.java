package lv.degra.accounting.core.user;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import lv.degra.accounting.core.user.client.KeycloakTokenClient;

@Service
public class KeycloakAuthService {

	private final KeycloakTokenClient keycloakTokenClient;

	@Value("${keycloak.credentials.secret}")
	private String credentialsSecret;

	@Autowired
	public KeycloakAuthService(KeycloakTokenClient keycloakTokenClient) {
		this.keycloakTokenClient = keycloakTokenClient;
	}

	public String getAccessToken() {
		MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
		request.add("grant_type", "client_credentials");
		request.add("client_id", "freight-tracking-client");
		request.add("client_secret", credentialsSecret);

		Map<String, Object> response = keycloakTokenClient.getAccessToken(
				MediaType.APPLICATION_FORM_URLENCODED_VALUE, request);
		return (String) response.get("access_token");
	}
}
