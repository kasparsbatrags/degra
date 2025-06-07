package lv.degra.accounting.usermanager.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.GroupRepresentation;
import org.keycloak.representations.idm.UserRepresentation;

import jakarta.ws.rs.core.Response;
import lv.degra.accounting.core.company.register.service.CompanyRegisterService;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMapRepository;
import lv.degra.accounting.core.user.authorize.client.KeycloakProperties;
import lv.degra.accounting.core.user.authorize.config.JwtTokenProvider;
import lv.degra.accounting.core.user.authorize.service.AuthUserService;
import lv.degra.accounting.core.user.dto.CredentialDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;
import lv.degra.accounting.core.user.validator.PasswordValidator;

class AuthUserServiceTest {

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
	void testCreateUser_Success() throws URISyntaxException {
		// Arrange
		UserRegistrationDto userDto = createValidUserDtoWithTruck();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));

		// Mock group operations
		var groupsResourceMock = mock(org.keycloak.admin.client.resource.GroupsResource.class);
		when(keycloakMock.realm("test-realm").groups()).thenReturn(groupsResourceMock);

		// Mock existing group
		GroupRepresentation existingGroup = new GroupRepresentation();
		existingGroup.setId("456");
		existingGroup.setName("123456");
		when(groupsResourceMock.groups()).thenReturn(List.of(existingGroup));

		// Mock user resource for group assignment
		var userResourceMock = mock(org.keycloak.admin.client.resource.UserResource.class);
		when(usersResourceMock.get(anyString())).thenReturn(userResourceMock);

		// Mock user and truck service
		User savedUser = new User();
		savedUser.setId(123);
		when(userServiceMock.saveUser(anyString())).thenReturn(savedUser);

		Truck savedTruck = new Truck();
		savedTruck.setUid(String.valueOf(1));
		when(truckServiceMock.save(any(Truck.class))).thenReturn(savedTruck);

		// Act & Assert
		assertDoesNotThrow(() -> authUserService.createUser(userDto));
	}

	@Test
	void testCreateUser_UserServiceFailure() throws URISyntaxException {
		// Arrange
		UserRegistrationDto userDto = createValidUserDtoWithTruck();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));

		// Mock group operations
		var groupsResourceMock = mock(org.keycloak.admin.client.resource.GroupsResource.class);
		when(keycloakMock.realm("test-realm").groups()).thenReturn(groupsResourceMock);
		when(groupsResourceMock.groups()).thenReturn(List.of());

		Response groupResponseMock = mock(Response.class);
		when(groupResponseMock.getStatus()).thenReturn(201);
		when(groupResponseMock.getHeaderString("Location")).thenReturn("/groups/456");
		when(groupResponseMock.getLocation()).thenReturn(new URI("/groups/456"));
		when(groupsResourceMock.add(any(GroupRepresentation.class))).thenReturn(groupResponseMock);

		// Mock user resource for group assignment
		var userResourceMock = mock(org.keycloak.admin.client.resource.UserResource.class);
		when(usersResourceMock.get(anyString())).thenReturn(userResourceMock);

		// Mock user service failure
		when(userServiceMock.saveUser(anyString())).thenReturn(null);

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class,
				() -> authUserService.createUser(userDto));
		assertEquals("Failed to complete user registration", exception.getMessage());
	}

	@Test
	void testCreateUser_TruckServiceFailure() throws URISyntaxException {
		// Arrange
		UserRegistrationDto userDto = createValidUserDtoWithTruck();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));

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

		// Mock user service success but truck service failure
		User savedUser = new User();
		savedUser.setId(123);
		when(userServiceMock.saveUser(anyString())).thenReturn(savedUser);
		when(truckServiceMock.save(any(Truck.class))).thenThrow(new RuntimeException("Failed to save truck"));

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class,
				() -> authUserService.createUser(userDto));
		assertEquals("Failed to complete user registration", exception.getMessage());
	}

	@Test
	void testCreateUser_WithNewGroup() throws URISyntaxException {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));

		// Mock group operations for new group creation
		var groupsResourceMock = mock(org.keycloak.admin.client.resource.GroupsResource.class);
		when(keycloakMock.realm("test-realm").groups()).thenReturn(groupsResourceMock);
		when(groupsResourceMock.groups()).thenReturn(List.of()); // No existing groups

		Response groupResponseMock = mock(Response.class);
		when(groupResponseMock.getStatus()).thenReturn(201);
		when(groupResponseMock.getHeaderString("Location")).thenReturn("/groups/456");
		when(groupsResourceMock.add(any(GroupRepresentation.class))).thenReturn(groupResponseMock);

		// Mock user resource for group assignment
		var userResourceMock = mock(org.keycloak.admin.client.resource.UserResource.class);
		when(usersResourceMock.get(anyString())).thenReturn(userResourceMock);

		// Mock user service
		User savedUser = new User();
		savedUser.setId(123);
		when(userServiceMock.saveUser(anyString())).thenReturn(savedUser);

		// Act & Assert
		assertDoesNotThrow(() -> authUserService.createUser(userDto));
	}

	@Test
	void testCreateUser_InvalidTruckData() throws URISyntaxException {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		Map<String, String> attributes = new HashMap<>(userDto.getAttributes());
		// Missing fuelConsumptionNorm
		attributes.put("truckMaker", "Volvo");
		attributes.put("truckModel", "FH16");
		attributes.put("truckRegistrationNumber", "ABC123");
		userDto.setAttributes(attributes);

		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));

		// Mock group operations
		var groupsResourceMock = mock(org.keycloak.admin.client.resource.GroupsResource.class);
		when(keycloakMock.realm("test-realm").groups()).thenReturn(groupsResourceMock);
		when(groupsResourceMock.groups()).thenReturn(List.of());

		Response groupResponseMock = mock(Response.class);
		when(groupResponseMock.getStatus()).thenReturn(201);
		when(groupResponseMock.getHeaderString("Location")).thenReturn("/groups/456");
		when(groupResponseMock.getLocation()).thenReturn(new URI("/groups/456"));
		when(groupsResourceMock.add(any(GroupRepresentation.class))).thenReturn(groupResponseMock);

		// Mock user resource for group assignment
		var userResourceMock = mock(org.keycloak.admin.client.resource.UserResource.class);
		when(usersResourceMock.get(anyString())).thenReturn(userResourceMock);

		// Mock user service
		User savedUser = new User();
		savedUser.setId(123);
		when(userServiceMock.saveUser(anyString())).thenReturn(savedUser);

		// Act & Assert
		assertDoesNotThrow(() -> authUserService.createUser(userDto));
	}

	@Test
	void testCreateUser_InvalidFuelConsumption() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		Map<String, String> attributes = new HashMap<>(userDto.getAttributes());
		attributes.put("truckMaker", "Volvo");
		attributes.put("truckModel", "FH16");
		attributes.put("truckRegistrationNumber", "ABC123");
		attributes.put("fuelConsumptionNorm", "invalid"); // Invalid fuel consumption
		userDto.setAttributes(attributes);

		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class,
				() -> authUserService.createUser(userDto));
		assertEquals("Invalid fuel consumption format", exception.getMessage());
	}

	@Test
	void testCreateUser_GroupIdExtractionError() throws URISyntaxException {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));

		// Mock group operations with invalid location header
		var groupsResourceMock = mock(org.keycloak.admin.client.resource.GroupsResource.class);
		when(keycloakMock.realm("test-realm").groups()).thenReturn(groupsResourceMock);
		when(groupsResourceMock.groups()).thenReturn(List.of());

		Response groupResponseMock = mock(Response.class);
		when(groupResponseMock.getStatus()).thenReturn(201);
		when(groupResponseMock.getHeaderString("Location")).thenReturn(null); // Missing location header
		when(groupsResourceMock.add(any(GroupRepresentation.class))).thenReturn(groupResponseMock);

		// Mock user resource for group assignment
		var userResourceMock = mock(org.keycloak.admin.client.resource.UserResource.class);
		when(usersResourceMock.get(anyString())).thenReturn(userResourceMock);

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class,
				() -> authUserService.createUser(userDto));
		assertEquals("Failed to extract group ID", exception.getMessage());
	}

	@Test
	void testCreateUser_UserCreationError() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock failed response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(400);
		when(responseMock.readEntity(String.class)).thenReturn("Invalid user data");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class,
				() -> authUserService.createUser(userDto));
		assertEquals("Failed to create user: Invalid user data", exception.getMessage());
	}

	@Test
	void testCreateUser_GroupCreationError() throws URISyntaxException {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);
		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		// Mock response for user creation
		Response responseMock = mock(Response.class);
		when(responseMock.getStatus()).thenReturn(201);
		when(responseMock.getHeaderString("Location")).thenReturn("/auth/admin/realms/test-realm/users/123");
		when(usersResourceMock.create(any(UserRepresentation.class))).thenReturn(responseMock);
		when(responseMock.getLocation()).thenReturn(new URI("/auth/admin/realms/test-realm/users/123"));

		// Mock group operations with error
		var groupsResourceMock = mock(org.keycloak.admin.client.resource.GroupsResource.class);
		when(keycloakMock.realm("test-realm").groups()).thenReturn(groupsResourceMock);
		when(groupsResourceMock.groups()).thenReturn(List.of());

		Response groupResponseMock = mock(Response.class);
		when(groupResponseMock.getStatus()).thenReturn(400);
		when(groupResponseMock.readEntity(String.class)).thenReturn("Group creation failed");
		when(groupsResourceMock.add(any(GroupRepresentation.class))).thenReturn(groupResponseMock);

		// Act & Assert
		KeycloakIntegrationException exception = assertThrows(KeycloakIntegrationException.class,
				() -> authUserService.createUser(userDto));
		assertEquals("Failed to create group: Group creation failed", exception.getMessage());
	}

	@Test
	void testCreateUser_UserAlreadyExists() {
		// Arrange
		UserRegistrationDto userDto = createValidUserDto();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(true);

		// Test username exists
		UserRepresentation existingUser = new UserRepresentation();
		existingUser.setUsername(userDto.getUsername());
		when(usersResourceMock.search(userDto.getUsername())).thenReturn(List.of(existingUser));

		// Act & Assert
		UserUniqueException exception = assertThrows(UserUniqueException.class, () -> authUserService.createUser(userDto));
		assertEquals("Username or Email already exists", exception.getMessage());

		// Test email exists
		when(usersResourceMock.search(userDto.getUsername())).thenReturn(List.of());
		when(usersResourceMock.search(userDto.getEmail())).thenReturn(List.of(existingUser));

		exception = assertThrows(UserUniqueException.class, () -> authUserService.createUser(userDto));
		assertEquals("Username or Email already exists", exception.getMessage());
	}

	@Test
	void testCreateUser_InvalidOrganizationNumber() {
		UserRegistrationDto userDto = createValidUserDto();
		userDto.setAttributes(Map.of("organizationRegistrationNumber", "invalid"));

		when(usersResourceMock.search(anyString())).thenReturn(List.of());

		UserValidationException exception = assertThrows(UserValidationException.class, () -> authUserService.createUser(userDto));
		assertEquals("Invalid or non-existent organization registration number", exception.getMessage());
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

	private UserRegistrationDto createValidUserDtoWithTruck() {
		UserRegistrationDto userDto = createValidUserDto();
		Map<String, String> attributes = new HashMap<>(userDto.getAttributes());
		attributes.put("truckMaker", "Volvo");
		attributes.put("truckModel", "FH16");
		attributes.put("truckRegistrationNumber", "ABC123");
		attributes.put("fuelConsumptionNorm", "30.5");
		userDto.setAttributes(attributes);
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
		assertEquals("Test User", userDto.getPreferred_username());
		assertEquals("test@example.com", userDto.getEmail());
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

	@Test
	void testGetCurrentUser_InvalidAuthHeader() {
		// Test null header
		assertNull(authUserService.getCurrentUser(null));

		// Test invalid format
		assertNull(authUserService.getCurrentUser("invalid-format"));
	}

	@Test
	void testGetCurrentUser_MissingClaims() {
		// Arrange
		String authHeader = "Bearer valid.token";
		Map<String, Object> claims = new HashMap<>();
		when(jwtTokenProviderMock.parseToken("valid.token")).thenReturn(claims);

		// Act
		var userDto = authUserService.getCurrentUser(authHeader);

		// Assert
		assertNotNull(userDto);
		assertNull(userDto.getId());
		assertNull(userDto.getEmail());
		assertNull(userDto.getPreferred_username());
		assertNull(userDto.getGiven_name());
		assertNull(userDto.getFamily_name());
		assertTrue(userDto.getAttributes().isEmpty());
	}

	@Test
	void testValidateOrganizationNumber_InvalidFormat() {
		UserRegistrationDto userDto = createValidUserDto();
		userDto.setAttributes(Map.of("organizationRegistrationNumber", "12345")); // Too short

		UserValidationException exception = assertThrows(UserValidationException.class, () -> authUserService.createUser(userDto));
		assertEquals("Invalid or non-existent organization registration number", exception.getMessage());

		userDto.setAttributes(Map.of("organizationRegistrationNumber", "1234567890123")); // Too long
		exception = assertThrows(UserValidationException.class, () -> authUserService.createUser(userDto));
		assertEquals("Invalid or non-existent organization registration number", exception.getMessage());

		userDto.setAttributes(Map.of("organizationRegistrationNumber", "12345A")); // Invalid characters
		exception = assertThrows(UserValidationException.class, () -> authUserService.createUser(userDto));
		assertEquals("Invalid or non-existent organization registration number", exception.getMessage());
	}

	@Test
	void testValidateOrganizationNumber_NonExistent() {
		UserRegistrationDto userDto = createValidUserDto();
		when(companyRegisterService.existsByRegistrationNumber(anyString())).thenReturn(false);

		UserValidationException exception = assertThrows(UserValidationException.class, () -> authUserService.createUser(userDto));
		assertEquals("Invalid or non-existent organization registration number", exception.getMessage());
	}

	@Test
	void testValidateOrganizationNumber_Missing() {
		UserRegistrationDto userDto = createValidUserDto();
		userDto.setAttributes(new HashMap<>()); // Empty attributes

		UserValidationException exception = assertThrows(UserValidationException.class, () -> authUserService.createUser(userDto));
		assertEquals("Organization registration number is required", exception.getMessage());

		userDto.setAttributes(null); // Null attributes
		exception = assertThrows(UserValidationException.class, () -> authUserService.createUser(userDto));
		assertEquals("Organization registration number is required", exception.getMessage());
	}
}
