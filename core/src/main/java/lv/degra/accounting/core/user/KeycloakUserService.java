package lv.degra.accounting.core.user;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.user.client.KeycloakAdminClient;

@Service
public class KeycloakUserService {

	private final KeycloakAuthService keycloakAuthService;
	private final KeycloakAdminClient keycloakAdminClient;

	public KeycloakUserService(KeycloakAuthService keycloakAuthService, KeycloakAdminClient keycloakAdminClient) {
		this.keycloakAuthService = keycloakAuthService;
		this.keycloakAdminClient = keycloakAdminClient;
	}

	public void createUser(UserRegistrationDto userRegistrationDto) {
		String accessToken = keycloakAuthService.getAccessToken();

		keycloakAdminClient.createUser("Bearer " + accessToken, userRegistrationDto);
	}
}

