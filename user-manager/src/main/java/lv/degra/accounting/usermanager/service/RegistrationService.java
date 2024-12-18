package lv.degra.accounting.usermanager.service;

import org.springframework.stereotype.Service;

import lv.degra.accounting.usermanager.client.KeycloakAdminClient;

@Service
public class RegistrationService {

	private final KeycloakAdminClient keycloakAdminClient;

	public RegistrationService(KeycloakAdminClient keycloakAdminClient) {
		this.keycloakAdminClient = keycloakAdminClient;
	}

	public String registerUser(String token, Object user) {
		return keycloakAdminClient.createUser("Bearer " + token, user);
	}
}
