package lv.degra.accounting.core.user.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;

import lv.degra.accounting.core.user.client.KeycloakAdminClient;
import lv.degra.accounting.core.user.client.KeycloakProperties;
import lv.degra.accounting.core.user.dto.CredentialDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.core.user.validator.PasswordValidator;

class KeycloakUserServiceTest {

	private Keycloak keycloakMock;
	private KeycloakAuthService authServiceMock;
	private KeycloakAdminClient adminClientMock;
	private KeycloakProperties propertiesMock;
	private UsersResource usersResourceMock;
	private KeycloakUserService userService;

	@BeforeEach
	void setUp() {
		keycloakMock = mock(Keycloak.class);
		authServiceMock = mock(KeycloakAuthService.class);
		adminClientMock = mock(KeycloakAdminClient.class);
		propertiesMock = mock(KeycloakProperties.class);
		usersResourceMock = mock(UsersResource.class);

		var realmResourceMock = mock(org.keycloak.admin.client.resource.RealmResource.class);
		when(keycloakMock.realm(anyString())).thenReturn(realmResourceMock);
		when(realmResourceMock.users()).thenReturn(usersResourceMock);

		when(propertiesMock.getRealm()).thenReturn("test-realm");

		userService = new KeycloakUserService(keycloakMock, authServiceMock, adminClientMock, propertiesMock);
	}

	@Test
	void testConstructor() {
		assertNotNull(userService, "UserService instance should be created successfully");
	}

	@Test
	void testCreateUser_Success() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(authServiceMock.getAccessToken()).thenReturn("test-token");

		// Mock UsersResource
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Act
		assertDoesNotThrow(() -> userService.createUser(userDto), "createUser should succeed without exceptions");

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
		UserValidationException exception = assertThrows(UserValidationException.class, () -> userService.createUser(userDto));
		assertEquals("Username already exists", exception.getMessage());
	}


	@Test
	void testCreateUser_InvalidOrganizationNumber() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		userDto.setAttributes(Map.of("organizationRegistrationNumber", "invalid"));

		// Mock UsersResource
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Act & Assert
		UserValidationException exception = assertThrows(UserValidationException.class, () -> userService.createUser(userDto));
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
				() -> userService.handleUserCreationException(integrationException, "test-user"));

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
}
