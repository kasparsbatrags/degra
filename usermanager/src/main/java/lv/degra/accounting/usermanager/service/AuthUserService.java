package lv.degra.accounting.usermanager.service;

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
import org.springframework.stereotype.Service;

import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.company.register.service.CompanyRegisterService;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMap;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMapRepository;
import lv.degra.accounting.core.user.dto.CredentialDto;
import lv.degra.accounting.core.user.dto.UserDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;
import lv.degra.accounting.core.user.validator.PasswordValidator;
import lv.degra.accounting.usermanager.client.KeycloakProperties;
import lv.degra.accounting.usermanager.config.JwtTokenProvider;

@Slf4j
@Service
public class AuthUserService {
	private static final String ORG_NUMBER_REGEX = "^[0-9]{6,12}$";
	public static final String BEARER_PREFIX = "Bearer ";

	private final Keycloak keycloak;
	private final KeycloakProperties keycloakProperties;
	private final PasswordValidator passwordValidator;
	private final CompanyRegisterService companyRegisterService;
	private final UserService userService;
	private final TruckService truckService;
	private final JwtTokenProvider jwtTokenProvider;
	private final TruckUserMapRepository truckUserMapRepository;

	public AuthUserService(Keycloak keycloak, KeycloakProperties keycloakProperties, UserService userService,
			CompanyRegisterService companyRegisterService, TruckService truckService, JwtTokenProvider jwtTokenProvider,
			TruckUserMapRepository truckUserMapRepository) {
		this.keycloak = keycloak;
		this.keycloakProperties = keycloakProperties;
		this.companyRegisterService = companyRegisterService;
		this.userService = userService;
		this.truckService = truckService;
		this.truckUserMapRepository = truckUserMapRepository;
		this.passwordValidator = new PasswordValidator();
		this.jwtTokenProvider = jwtTokenProvider;
	}

	public void createUser(UserRegistrationDto userRegistrationDto) {
		validateUserRegistration(userRegistrationDto);

		UsersResource usersResource = getUsersResource();
		String organizationRegistrationNumber = userRegistrationDto.getAttributes().get("organizationRegistrationNumber");
		Truck truck = getTruckData(userRegistrationDto);
		UserRepresentation userRepresentation = new UserRepresentation();
		userRepresentation.setUsername(userRegistrationDto.getUsername());
		userRepresentation.setEmail(userRegistrationDto.getEmail());
		userRepresentation.setFirstName(userRegistrationDto.getFirstName());
		userRepresentation.setLastName(userRegistrationDto.getLastName());
		userRepresentation.setEnabled(true);

		// Set credentials from CredentialDto
		List<CredentialDto> credentials = userRegistrationDto.getCredentials();
		if (!credentials.isEmpty()) {
			userRepresentation.setCredentials(credentials.stream().map(credentialDto -> {
				org.keycloak.representations.idm.CredentialRepresentation credential = new org.keycloak.representations.idm.CredentialRepresentation();
				credential.setType(org.keycloak.representations.idm.CredentialRepresentation.PASSWORD);
				credential.setValue(credentialDto.getValue());
				credential.setTemporary(false);
				return credential;
			}).toList());
		}

		Map<String, List<String>> attributes = new HashMap<>();
		attributes.put("organizationRegistrationNumber", List.of(organizationRegistrationNumber));
		userRepresentation.setAttributes(attributes);

		// Create user
		Response response = usersResource.create(userRepresentation);
		String userId = null;
		try {
			if (response.getStatus() == 201) {
				String location = response.getHeaderString("Location");
				userId = location.substring(location.lastIndexOf("/") + 1);
				log.info("User created successfully: {}", userRegistrationDto.getUsername());

				String groupId = getOrCreateGroup(organizationRegistrationNumber);
				addUserToGroup(userId, groupId, organizationRegistrationNumber);

				User user = userService.saveUser(userId);
				if (user != null && truck != null) {
					truckService.save(truck);
					TruckUserMap truckUserMap = new TruckUserMap();
					truckUserMap.setTruck(truck);
					truckUserMap.setUser(user);
					truckUserMap.setIsDefault(true);
					truckUserMapRepository.save(truckUserMap);
				}
			} else {
				String errorMessage = response.readEntity(String.class);
				log.error("Failed to create user. Status: {} Error: {}", response.getStatus(), errorMessage);
				throw new KeycloakIntegrationException("Failed to create user: " + errorMessage, "USER_CREATION_ERROR");
			}
		} catch (Exception e) {
			log.error("Error during user creation or group assignment: {}", e.getMessage());
			if (userId != null) {
				// Cleanup: try to delete the user if group operations failed
				usersResource.get(userId).remove();
			}
			throw new KeycloakIntegrationException("Failed to complete user registration: " + e.getMessage(), "USER_REGISTRATION_ERROR");
		} finally {
			response.close();
		}
	}

	private Truck getTruckData(UserRegistrationDto userRegistrationDto) {
		Map<String, String> attributes = userRegistrationDto.getAttributes();

		String truckMake = attributes.get("truckMaker");
		String truckModel = attributes.get("truckModel");
		String truckRegistrationNumber = attributes.get("truckRegistrationNumber");
		String fuelConsumptionNorm = attributes.get("fuelConsumptionNorm");

		if (truckMake == null || truckModel == null || truckRegistrationNumber == null || fuelConsumptionNorm == null) {
			return null;
		}

		new Truck();
		return Truck.builder().truckMaker(truckMake).truckModel(truckModel).registrationNumber(truckRegistrationNumber)
				.fuelConsumptionNorm(Double.parseDouble(fuelConsumptionNorm)).build();
	}

	private Optional<GroupRepresentation> findGroupByName(String groupName) {
		GroupsResource groupsResource = keycloak.realm(keycloakProperties.getRealm()).groups();
		return groupsResource.groups().stream().filter(group -> group.getName().equals(groupName)).findFirst();
	}

	private String createGroup(String groupName) {
		GroupsResource groupsResource = keycloak.realm(keycloakProperties.getRealm()).groups();
		GroupRepresentation groupRepresentation = new GroupRepresentation();
		groupRepresentation.setName(groupName);

		Response response = groupsResource.add(groupRepresentation);
		try {
			if (response.getStatus() == 201) {
				String location = response.getHeaderString("Location");
				String groupId = location.substring(location.lastIndexOf("/") + 1);
				log.info("Group created successfully: {}", groupName);
				return groupId;
			} else {
				String errorMessage = response.readEntity(String.class);
				log.error("Failed to create group. Status: {} Error: {}", response.getStatus(), errorMessage);
				throw new KeycloakIntegrationException("Failed to create group: " + errorMessage, "GROUP_CREATION_ERROR");
			}
		} finally {
			response.close();
		}
	}

	private String getOrCreateGroup(String groupName) {
		return findGroupByName(groupName).map(GroupRepresentation::getId).orElseGet(() -> createGroup(groupName));
	}

	private void addUserToGroup(String userId, String groupId, String groupName) {
		UsersResource usersResource = getUsersResource();
		usersResource.get(userId).joinGroup(groupId);
		log.info("User added to group: {}", groupName);
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

	protected Map<String, Object> extractClaims(String token) {
		return jwtTokenProvider.parseToken(token);
	}

	private Map<String, String> extractOrganizationInfo(Map<String, Object> claims) {
		try {
			@SuppressWarnings("unchecked")
			Map<String, List<String>> attributes = (Map<String, List<String>>) claims.get("attributes");
			if (attributes != null && attributes.containsKey("organizationRegistrationNumber")) {
				List<String> orgNumbers = attributes.get("organizationRegistrationNumber");
				if (!orgNumbers.isEmpty()) {
					return Collections.singletonMap("organizationRegistrationNumber", orgNumbers.getFirst());
				}
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
