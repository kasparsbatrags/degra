package lv.degra.accounting.core.user.service;

import java.util.Map;
import java.util.Optional;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.user.client.KeycloakAdminClient;
import lv.degra.accounting.core.user.client.KeycloakProperties;
import lv.degra.accounting.core.user.dto.CredentialDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.core.user.validator.PasswordValidator;

@Slf4j
@Service
public class KeycloakUserService {
	private static final String ORG_NUMBER_REGEX = "^[0-9]{6,12}$";
	private static final String BEARER_PREFIX = "Bearer ";

	private final Keycloak keycloak;
	private final KeycloakAuthService keycloakAuthService;
	private final KeycloakAdminClient keycloakAdminClient;
	private final KeycloakProperties keycloakProperties;
	private final PasswordValidator passwordValidator;

	public KeycloakUserService(Keycloak keycloak, KeycloakAuthService keycloakAuthService, KeycloakAdminClient keycloakAdminClient,
			KeycloakProperties keycloakProperties) {
		this.keycloak = keycloak;
		this.keycloakAuthService = keycloakAuthService;
		this.keycloakAdminClient = keycloakAdminClient;
		this.keycloakProperties = keycloakProperties;
		this.passwordValidator = new PasswordValidator();
	}

	@Retryable(value = { KeycloakIntegrationException.class }, maxAttempts = 3, backoff = @Backoff(delay = 1000))
	public void createUser(UserRegistrationDto userRegistrationDto) {
		validateUserRegistration(userRegistrationDto);

		try {
			String accessToken = keycloakAuthService.getAccessToken();
			executeUserCreation(userRegistrationDto, accessToken);
			log.info("Successfully created user: {}", userRegistrationDto.getUsername());
		} catch (Exception e) {
			handleUserCreationException(e, userRegistrationDto.getUsername());
		}
	}

	private void executeUserCreation(UserRegistrationDto userRegistrationDto, String accessToken) {
		String bearerToken = BEARER_PREFIX + accessToken;
		keycloakAdminClient.createUser(bearerToken, userRegistrationDto);
	}

	private void validateUserRegistration(UserRegistrationDto dto) {
		validateUserUniqueness(dto);
		dto.getCredentials().forEach(this::validateCredentials);
		validateOrganizationNumber(dto.getAttributes());
	}

	private void validateUserUniqueness(UserRegistrationDto dto) {
		UsersResource usersResource = getUsersResource();

		if (!usersResource.search(dto.getUsername()).isEmpty()) {
			throw new UserValidationException("Username already exists");
		}

		if (!usersResource.search(dto.getEmail()).isEmpty()) {
			throw new UserValidationException("Email already exists");
		}
	}

	private void validateCredentials(CredentialDto credentials) {
		if (credentials == null) {
			throw new UserValidationException("Credentials are required");
		}

		String password = credentials.getValue();
		passwordValidator.validate(password);
	}

	private void validateOrganizationNumber(Map<String, String> attributes) {
		String orgNumber = Optional.ofNullable(attributes).map(attrs -> attrs.get("organizationRegistrationNumber"))
				.orElseThrow(() -> new UserValidationException("Organization registration number is required"));

		if (!orgNumber.matches(ORG_NUMBER_REGEX)) {
			throw new UserValidationException("Invalid organization registration number format");
		}
	}

	private UsersResource getUsersResource() {
		return keycloak.realm(keycloakProperties.getRealm()).users();
	}

	protected void handleUserCreationException(Exception e, String username) {
		log.error("Failed to create user: {}", username, e);

		if (e instanceof KeycloakIntegrationException) {
			throw (KeycloakIntegrationException) e;
		}

		throw new KeycloakIntegrationException("Failed to create user: " + e.getMessage(), "INTERNAL_ERROR");
	}
}