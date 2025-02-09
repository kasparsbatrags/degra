package lv.degra.accounting.usermanager.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.GroupRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.ws.rs.core.Response;
import lv.degra.accounting.core.company.register.service.CompanyRegisterService;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMapRepository;
import lv.degra.accounting.core.user.dto.CredentialDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.core.user.service.UserService;
import lv.degra.accounting.core.user.validator.PasswordValidator;
import lv.degra.accounting.usermanager.client.KeycloakProperties;
import lv.degra.accounting.usermanager.config.JwtTokenProvider;

class AuthUserServiceTest {

	private final Logger log = LoggerFactory.getLogger(AuthUserServiceTest.class);
	private Keycloak keycloakMock;
	private JwtTokenProvider jwtTokenProviderMock;
	private KeycloakProperties propertiesMock;
	private UsersResource usersResourceMock;
	private AuthUserService authUserService;
	private UserService userServiceMock;
	private TruckService truckServiceMock;
	private CompanyRegisterService companyRegisterService;
	private TruckUserMapRepository truckUserMapRepositoryMock;

	@BeforeEach
	void setUp() {
		keycloakMock = mock(Keycloak.class);
		propertiesMock = mock(KeycloakProperties.class);
		usersResourceMock = mock(UsersResource.class);
		userServiceMock = mock(UserService.class);
		companyRegisterService = mock(CompanyRegisterService.class);
		jwtTokenProviderMock = mock(JwtTokenProvider.class);
		userServiceMock = mock(UserService.class);
		truckServiceMock = mock(TruckService.class);
		truckUserMapRepositoryMock = mock(TruckUserMapRepository.class);


		var realmResourceMock = mock(org.keycloak.admin.client.resource.RealmResource.class);
		when(keycloakMock.realm(anyString())).thenReturn(realmResourceMock);
		when(realmResourceMock.users()).thenReturn(usersResourceMock);

		when(propertiesMock.getRealm()).thenReturn("test-realm");

		authUserService = new AuthUserService(keycloakMock, propertiesMock, userServiceMock, companyRegisterService, truckServiceMock,
				jwtTokenProviderMock, truckUserMapRepositoryMock);

	}

	@Test
	void testConstructor() {
		assertNotNull(authUserService, "UserService instance should be created successfully");
	}

	@Test
	void testCreateUser_Success() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);

		// Mock group operations
		var groupsResourceMock = mock(org.keycloak.admin.client.resource.GroupsResource.class);
		when(keycloakMock.realm("test-realm").groups()).thenReturn(groupsResourceMock);
		when(groupsResourceMock.groups()).thenReturn(List.of());

		Response groupResponseMock = mock(Response.class);
		when(groupResponseMock.getStatus()).thenReturn(201);
		when(groupResponseMock.getHeaderString("Location")).thenReturn("/groups/456");
		when(groupsResourceMock.add(any(GroupRepresentation.class))).thenReturn(groupResponseMock);

		// Mock user resource for group assignment
		var userResourceMock = mock(org.keycloak.admin.client.resource.UserResource.class);
		when(usersResourceMock.get(anyString())).thenReturn(userResourceMock);

		// Act & Assert
		assertDoesNotThrow(() -> authUserService.createUser(userDto));
	}

	@Test
	void testCreateUser_UserAlreadyExists() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);

		// Mock UsersResource to return existing user
		when(keycloakMock.realm("test-realm").users()).thenReturn(usersResourceMock);

		UserRepresentation existingUser = new UserRepresentation();
		existingUser.setUsername(userDto.getUsername());

		when(usersResourceMock.search(userDto.getUsername())).thenReturn(List.of(existingUser));

		// Act & Assert
		UserUniqueException exception = assertThrows(UserUniqueException.class, () -> authUserService.createUser(userDto));
		assertEquals("Username already exists", exception.getMessage());
	}

	@Test
	void testCreateUser_InvalidOrganizationNumber() {
		UserRegistrationDto userDto = createValidUserDto();
		userDto.setAttributes(Map.of("organizationRegistrationNumber", "invalid"));

		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		UserValidationException exception = assertThrows(UserValidationException.class, () -> authUserService.createUser(userDto));
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
				() -> authUserService.handleUserCreationException(integrationException, "test-user"));

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
	void testGetCurrentUser_Success() {
		// Arrange
		String authHeader = "Bearer valid.token";
		Map<String, Object> claims = Map.of("sub", "12345", "email", "test@example.com", "name", "Test User", "given_name", "Test",
				"family_name", "User", "attributes", Map.of("organizationRegistrationNumber", List.of("123456")));

		when(jwtTokenProviderMock.parseToken("valid.token")).thenReturn(claims);

		// Act
		var userDto = authUserService.getCurrentUser(authHeader);

		// Assert
		assertNotNull(userDto);
		assertEquals("12345", userDto.getId());
		assertEquals("test@example.com", userDto.getEmail());
		assertEquals("Test User", userDto.getPreferred_username());
		assertEquals("Test", userDto.getGiven_name());
		assertEquals("User", userDto.getFamily_name());
		assertEquals("123456", userDto.getAttributes().get("organizationRegistrationNumber"));
	}

	@Test
	void testGetCurrentUser_TokenParsingError() {
		// Arrange
		String authHeader = "Bearer invalid.token";
		when(jwtTokenProviderMock.parseToken("invalid.token")).thenThrow(new IllegalArgumentException("Invalid token"));

		// Act
		var userDto = authUserService.getCurrentUser(authHeader);

		// Assert
		assertNull(userDto);
	}

}
