package lv.degra.accounting.usermanager.service;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.GroupsResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.GroupRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.company.register.service.CompanyRegisterService;
import lv.degra.accounting.core.customer.service.CustomerService;
import lv.degra.accounting.core.user.dto.CredentialDto;
import lv.degra.accounting.core.user.dto.UserDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.core.user.maper.UserMapper;
import lv.degra.accounting.core.user.service.UserService;
import lv.degra.accounting.core.user.validator.PasswordValidator;
import lv.degra.accounting.usermanager.client.KeycloakAdminClient;
import lv.degra.accounting.usermanager.client.KeycloakProperties;

@Slf4j
@Service
public class AuthUserService {
	private static final String ORG_NUMBER_REGEX = "^[0-9]{6,12}$";
	private static final String BEARER_PREFIX = "Bearer ";

	private final Keycloak keycloak;
	private final AuthService authService;
	private final KeycloakAdminClient keycloakAdminClient;
	private final KeycloakProperties keycloakProperties;
	private final PasswordValidator passwordValidator;
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final CustomerService customerService;
	private final UserService userService;
	private final UserMapper userMapper;
	private final CompanyRegisterService companyRegisterService;

	public AuthUserService(Keycloak keycloak, AuthService authService, KeycloakAdminClient keycloakAdminClient,
			KeycloakProperties keycloakProperties, CustomerService customerService, UserService userService, UserMapper userMapper,
			CompanyRegisterService companyRegisterService) {
		this.keycloak = keycloak;
		this.authService = authService;
		this.keycloakAdminClient = keycloakAdminClient;
		this.keycloakProperties = keycloakProperties;
		this.customerService = customerService;
		this.userService = userService;
		this.userMapper = userMapper;
		this.companyRegisterService = companyRegisterService;
		this.passwordValidator = new PasswordValidator();
	}

	public void createUser(UserRegistrationDto userRegistrationDto) {
		validateUserRegistration(userRegistrationDto);

		UsersResource usersResource = getUsersResource();

		UserRepresentation userRepresentation = new UserRepresentation();
		userRepresentation.setUsername(userRegistrationDto.getUsername());
		userRepresentation.setEmail(userRegistrationDto.getEmail());
		userRepresentation.setFirstName(userRegistrationDto.getFirstName());
		userRepresentation.setLastName(userRegistrationDto.getLastName());
		userRepresentation.setEnabled(true);
		Map<String, List<String>> attributes = new HashMap<>();
		String organizationRegistrationNumber = userRegistrationDto.getAttributes().get("organizationRegistrationNumber");
		attributes.put("organizationRegistrationNumber", List.of(organizationRegistrationNumber));
		userRepresentation.setAttributes(attributes);

		Response response = usersResource.create(userRepresentation);
		try {
			if (response.getStatus() == 201) {
				log.info("User created successfully: {}", userRegistrationDto.getUsername());
			} else {
				String errorMessage = response.readEntity(String.class);
				log.error("Failed to create user. Status: {} Error: {}", response.getStatus(), errorMessage);
				throw new KeycloakIntegrationException("Failed to create user: " + errorMessage, "USER_CREATION_ERROR");
			}
		} finally {
			response.close();
		}
	}

	@Retryable(value = { KeycloakIntegrationException.class }, maxAttempts = 3, backoff = @Backoff(delay = 1000))
	public void deleteUserByEmailAndOrganization(String email, String organizationRegistrationNumber) {
		try {
			UsersResource usersResource = getUsersResource();

			List<UserRepresentation> users = usersResource.search(null, null, null, email, null, null);
			if (users.isEmpty()) {
				throw new UserValidationException("No user found with email: " + email);
			}

			List<UserRepresentation> matchingUsers = users.stream().filter(user -> {
				Map<String, List<String>> attributes = user.getAttributes();
				return attributes != null && attributes.containsKey("organizationRegistrationNumber") && attributes.get(
						"organizationRegistrationNumber").contains(organizationRegistrationNumber);
			}).toList();

			if (matchingUsers.isEmpty()) {
				throw new UserValidationException(
						"No user found with email: " + email + " and organization: " + organizationRegistrationNumber);
			}

			if (matchingUsers.size() > 1) {
				throw new UserValidationException(
						"Multiple users found with email: " + email + " and organization: " + organizationRegistrationNumber);
			}

			String userId = matchingUsers.get(0).getId();
			usersResource.delete(userId);
			log.info("Successfully deleted user with email: {} and organization: {}", email, organizationRegistrationNumber);

		} catch (UserValidationException e) {
			log.error("Validation error: {}", e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error("Failed to delete user with email: {} and organization: {}", email, organizationRegistrationNumber, e);
			throw new KeycloakIntegrationException("Failed to delete user: " + e.getMessage(), "INTERNAL_ERROR");
		}
	}

	public void createGroup(String groupName) {
		GroupsResource groupsResource = keycloak.realm(keycloakProperties.getRealm()).groups();

		GroupRepresentation groupRepresentation = new GroupRepresentation();
		groupRepresentation.setName(groupName);

		Response response = groupsResource.add(groupRepresentation);
		if (response.getStatus() == 201) {
			System.out.println("Group created successfully: " + groupName);
		} else {
			System.out.println("Failed to create group: " + response.readEntity(String.class));
		}
		response.close();
	}

	public UserDto getCurrentUser(String authHeader) {
		String token = authHeader.substring(7);
		try {
			Map<String, Object> claims = extractClaims(token);

			return new UserDto((String) claims.get("sub"), (String) claims.get("email"), (String) claims.get("name"),
					(String) claims.get("given_name"), (String) claims.get("family_name"), extractOrganizationInfo(claims));
		} catch (Exception e) {
			log.error("Error parsing JWT token", e);
			return null;
		}
	}

	protected Map<String, Object> extractClaims(String token) throws IOException {
		try {
			String[] chunks = token.split("\\.");
			if (chunks.length < 2) {
				throw new IllegalArgumentException("Invalid JWT token format");
			}

			Base64.Decoder decoder = Base64.getUrlDecoder();
			String payload = new String(decoder.decode(chunks[1]));
			return objectMapper.readValue(payload, Map.class);
		} catch (Exception e) {
			log.error("Error decoding JWT token", e);
			throw new KeycloakIntegrationException("Failed to decode JWT token: " + e.getMessage(), "INVALID_TOKEN");
		}
	}

	@SuppressWarnings("unchecked")
	private Map<String, String> extractOrganizationInfo(Map<String, Object> claims) {
		try {
			Map<String, Object> attributes = (Map<String, Object>) claims.get("attributes");
			if (attributes != null && attributes.containsKey("organizationRegistrationNumber")) {
				List<String> orgNumbers = (List<String>) attributes.get("organizationRegistrationNumber");
				return Collections.singletonMap("organizationRegistrationNumber", orgNumbers.getFirst());
			}
		} catch (Exception e) {
			log.warn("Error extracting organization info from claims", e);
		}
		return Collections.emptyMap();
	}

	private void validateUserRegistration(UserRegistrationDto dto) {
		dto.getCredentials().forEach(this::validateCredentials);
		validateOrganizationNumber(dto.getAttributes());
		if (dto.getUsername() == null || dto.getEmail() == null) {
			throw new IllegalArgumentException("User registration data is incomplete (username or email)");
		}
		validateUserUniqueness(dto);
	}

	private void validateUserUniqueness(UserRegistrationDto dto) {
		UsersResource usersResource = getUsersResource();

		if (!usersResource.search(dto.getUsername()).isEmpty()) {
			throw new UserUniqueException("Username already exists");
		}

		if (!usersResource.search(dto.getEmail()).isEmpty()) {
			throw new UserUniqueException("Email already exists");
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

		if (!companyRegisterService.existsByRegistrationNumber(orgNumber)) {
			throw new UserValidationException("Company with registration number " + orgNumber + " does not exist");
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
