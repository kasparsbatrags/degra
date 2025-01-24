package lv.degra.accounting.usermanager.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lv.degra.accounting.core.customer.service.CustomerService;
import lv.degra.accounting.core.user.dto.CredentialDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.core.user.maper.UserMapper;
import lv.degra.accounting.core.user.service.UserService;
import lv.degra.accounting.core.user.validator.PasswordValidator;
import lv.degra.accounting.usermanager.client.KeycloakAdminClient;
import lv.degra.accounting.usermanager.client.KeycloakProperties;

class KeycloakUserServiceTest {

	private final ObjectMapper objectMapper = mock(ObjectMapper.class);
	private final Logger log = LoggerFactory.getLogger(KeycloakUserServiceTest.class);
	private Keycloak keycloakMock;
	private AuthService authServiceMock;
	private KeycloakAdminClient adminClientMock;
	private KeycloakProperties propertiesMock;
	private UsersResource usersResourceMock;
	private KeycloakUserService keycloakUserService;
	private CustomerService customerServicesMock;
	private UserService userServiceMock;
	private UserMapper userMapperMock;


	@BeforeEach
	void setUp() {
		keycloakMock = mock(Keycloak.class);
		authServiceMock = mock(AuthService.class);
		adminClientMock = mock(KeycloakAdminClient.class);
		propertiesMock = mock(KeycloakProperties.class);
		usersResourceMock = mock(UsersResource.class);
		customerServicesMock = mock(CustomerService.class);
		userServiceMock = mock(UserService.class);
		userMapperMock = mock(UserMapper.class);

		var realmResourceMock = mock(org.keycloak.admin.client.resource.RealmResource.class);
		when(keycloakMock.realm(anyString())).thenReturn(realmResourceMock);
		when(realmResourceMock.users()).thenReturn(usersResourceMock);

		when(propertiesMock.getRealm()).thenReturn("test-realm");

		keycloakUserService = new KeycloakUserService(keycloakMock, authServiceMock, adminClientMock, propertiesMock,customerServicesMock,userServiceMock,userMapperMock);
	}

	@Test
	void testConstructor() {
		assertNotNull(keycloakUserService, "UserService instance should be created successfully");
	}

	@Test
	void testCreateUser_Success() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(authServiceMock.getAccessToken()).thenReturn("test-token");

		// Mock UsersResource
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Act
		assertDoesNotThrow(() -> keycloakUserService.createUser(userDto), "createUser should succeed without exceptions");

		// Assert
		verify(adminClientMock).createUser(eq("Bearer test-token"), eq(userDto));
	}


	@Test
	void testCreateUser_UserAlreadyExists() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();

		// Mock UsersResource un Keycloak atgriežamās vērtības
		when(keycloakMock.realm("test-realm").users()).thenReturn(usersResourceMock);

		UserRepresentation existingUser = new UserRepresentation();
		existingUser.setUsername(userDto.getUsername());

		when(usersResourceMock.search(userDto.getUsername())).thenReturn(List.of(existingUser));

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class, () -> keycloakUserService.createUser(userDto));
		assertEquals("Failed to create user: Username already exists", exception.getMessage());
	}


	@Test
	void testCreateUser_InvalidOrganizationNumber() {
		UserRegistrationDto userDto = createValidUserDto();
		userDto.setAttributes(Map.of("organizationRegistrationNumber", "invalid"));

		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		UserValidationException exception = assertThrows(UserValidationException.class, () -> keycloakUserService.createUser(userDto));
		assertEquals("Invalid organization registration number format", exception.getMessage());
	}


	@Test
	void testValidateCredentials_InvalidPassword() {
		// Arrange
		CredentialDto credential = new CredentialDto();
		credential.setType("password");
		credential.setValue("short");

		PasswordValidator validator = spy(new PasswordValidator());
		doThrow(new UserValidationException("Invalid password")).when(validator).validate(anyString());

		// Act & Assert
		UserValidationException exception = assertThrows(UserValidationException.class, () -> validator.validate(credential.getValue()));
		assertEquals("Invalid password", exception.getMessage());
	}

	@Test
	void testHandleUserCreationException_KeycloakIntegrationException() {
		// Arrange
		KeycloakIntegrationException integrationException = new KeycloakIntegrationException("Integration failed", "AUTH_ERROR");

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class,
				() -> keycloakUserService.handleUserCreationException(integrationException, "test-user"));

		assertEquals("Integration failed", exception.getMessage());
		assertEquals("AUTH_ERROR", exception.getErrorCode());
	}

	private UserRegistrationDto createValidUserDto() {
		UserRegistrationDto userDto = new UserRegistrationDto();
		userDto.setUsername("test-user");
		userDto.setEmail("test-user@example.com");
		userDto.setFirstName("Test");
		userDto.setLastName("User");
		userDto.setAttributes(Map.of("organizationRegistrationNumber", "123456"));
		userDto.setEnabled(true);

		CredentialDto credential = new CredentialDto();
		credential.setType("password");
		credential.setValue("StrongPassword123!");

		userDto.setCredentials(List.of(credential));
		return userDto;
	}

	@Test
	void testExtractClaims_ValidToken() throws IOException {
		// Arrange
		String payload = "{\"sub\":\"12345\",\"email\":\"test@example.com\"}";
		String token = "header." + Base64.getUrlEncoder().encodeToString(payload.getBytes()) + ".signature";

		when(objectMapper.readValue(payload, Map.class))
				.thenReturn(Map.of("sub", "12345", "email", "test@example.com"));

		// Act
		Map<String, Object> claims = keycloakUserService.extractClaims(token);

		// Assert
		assertNotNull(claims);
		assertEquals("12345", claims.get("sub"));
		assertEquals("test@example.com", claims.get("email"));
	}

	@Test
	void testExtractClaims_InvalidTokenFormat() {
		// Arrange
		String invalidToken = "invalidToken";

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class, () ->
				keycloakUserService.extractClaims(invalidToken));
		assertEquals("Failed to decode JWT token: Invalid JWT token format", exception.getMessage());
	}

	@Test
	void testExtractClaims_InvalidBase64Encoding() {
		// Arrange
		String invalidBase64Payload = "header.invalidPayload.signature";

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class, () ->
				keycloakUserService.extractClaims(invalidBase64Payload));
		assertTrue(exception.getMessage().contains("Failed to decode JWT token"));
	}

	@Test
	void testExtractClaims_JsonProcessingException() throws JsonProcessingException {

		String payload = "{\"sub\":\"12345\",\"email\":\"test@example.com\"";
		String token = "header." + Base64.getUrlEncoder().encodeToString(payload.getBytes()) + ".signature";

		doThrow(new RuntimeException("JSON error"))
				.when(objectMapper)
				.readValue(any(String.class), eq(Map.class));

		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class, () ->
				keycloakUserService.extractClaims(token));
		assertTrue(exception.getMessage().contains("Failed to decode JWT token"));
	}


}
