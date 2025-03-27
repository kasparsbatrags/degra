package lv.degra.accounting.core.user.authorize.service;

import static lv.degra.accounting.core.user.authorize.config.UserManagerConstants.BEARER_PREFIX;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.GroupsResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
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
import lv.degra.accounting.core.user.authorize.client.KeycloakProperties;
import lv.degra.accounting.core.user.authorize.config.JwtTokenProvider;
import lv.degra.accounting.core.user.dto.CredentialDto;
import lv.degra.accounting.core.user.dto.UserManagementDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;
import lv.degra.accounting.core.user.validator.PasswordValidator;

@Slf4j
@Service
public class AuthUserService {
	private static final String ORG_NUMBER_REGEX = "^[0-9]{6,12}$";

	private final Keycloak keycloak;
	private final KeycloakProperties keycloakProperties;
	private final PasswordValidator passwordValidator;
	private final CompanyRegisterService companyRegisterService;
	private final UserService userService;
	private final TruckService truckService;
	private final JwtTokenProvider jwtTokenProvider;
	private final TruckUserMapRepository truckUserMapRepository;

	public AuthUserService(Keycloak keycloak, KeycloakProperties keycloakProperties, UserService userService,
			CompanyRegisterService companyRegisterService, TruckService truckService,
			JwtTokenProvider jwtTokenProvider, TruckUserMapRepository truckUserMapRepository) {
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
		Truck truck = getTruckData(userRegistrationDto);

		UserRepresentation userRepresentation = mapToUserRepresentation(userRegistrationDto);

		Response response = null;
		try {
			response = usersResource.create(userRepresentation);
			if (response.getStatus() != 201) {
				throw new KeycloakIntegrationException("Failed to create user: " + response.readEntity(String.class), "USER_CREATION_ERROR");
			}

			String userId = extractUserId(response);
			log.info("User created successfully: {}", userRegistrationDto.getUsername());

			String groupId = getOrCreateGroup(userRegistrationDto.getAttributes().get("organizationRegistrationNumber"));
			addUserToGroup(userId, groupId);

			User user = userService.saveUser(userId);
			if (user == null) {
				throw new KeycloakIntegrationException("Failed to complete user registration", "USER_SAVE_ERROR");
			}

			if (truck != null) {
				try {
					truckService.save(truck);
					truckUserMapRepository.save(new TruckUserMap(truck, user, true));
				} catch (Exception e) {
					log.error("Error saving truck data: {}", e.getMessage());
					throw new KeycloakIntegrationException("Failed to complete user registration", "USER_REGISTRATION_ERROR");
				}
			}
		} catch (KeycloakIntegrationException e) {
			log.error("Keycloak integration error: {}", e.getMessage());
			throw e;
		} finally {
			if (response != null) {
				response.close();
			}
		}
	}

	private UserRepresentation mapToUserRepresentation(UserRegistrationDto userRegistrationDto) {
		UserRepresentation user = new UserRepresentation();
		user.setUsername(userRegistrationDto.getUsername());
		user.setEmail(userRegistrationDto.getEmail());
		user.setFirstName(userRegistrationDto.getFirstName());
		user.setLastName(userRegistrationDto.getLastName());
		user.setEnabled(true);

		user.setCredentials(userRegistrationDto.getCredentials().stream()
				.map(credentialDto -> {
					CredentialRepresentation credential = new CredentialRepresentation();
					credential.setType(CredentialRepresentation.PASSWORD);
					credential.setValue(credentialDto.getValue());
					credential.setTemporary(false);
					return credential;
				}).collect(Collectors.toList()));

		Map<String, List<String>> attributes = new HashMap<>();
		attributes.put("organizationRegistrationNumber", List.of(userRegistrationDto.getAttributes().get("organizationRegistrationNumber")));
		user.setAttributes(attributes);
		user.setRequiredActions(List.of("VERIFY_EMAIL"));
		return user;
	}

	private Truck getTruckData(UserRegistrationDto userRegistrationDto) {
		Map<String, String> attributes = userRegistrationDto.getAttributes();

		if (attributes == null) {
			return null;
		}

		boolean hasTruckData = attributes.containsKey("truckMaker") && 
							  attributes.containsKey("truckModel") &&
							  attributes.containsKey("truckRegistrationNumber") && 
							  attributes.containsKey("fuelConsumptionNorm");

		if (!hasTruckData) {
			return null;
		}

		try {
			Truck truck = new Truck();
			truck.setTruckMaker(attributes.get("truckMaker"));
			truck.setTruckModel(attributes.get("truckModel"));
			truck.setRegistrationNumber(attributes.get("truckRegistrationNumber"));
			truck.setFuelConsumptionNorm(Double.parseDouble(attributes.get("fuelConsumptionNorm")));
			return truck;

		} catch (NumberFormatException e) {
			log.error("Invalid fuel consumption format: {}", e.getMessage());
			throw new KeycloakIntegrationException("Invalid fuel consumption format", "INVALID_FUEL_CONSUMPTION");
		}
	}

	private Optional<GroupRepresentation> findGroupByName(String groupName) {
		return keycloak.realm(keycloakProperties.getRealm()).groups().groups()
				.stream().filter(group -> group.getName().equals(groupName)).findFirst();
	}

	private String createGroup(String groupName) {
		GroupsResource groupsResource = keycloak.realm(keycloakProperties.getRealm()).groups();
		GroupRepresentation group = new GroupRepresentation();
		group.setName(groupName);

		try (Response response = groupsResource.add(group)) {
			if (response.getStatus() != 201) {
				String errorMessage = response.readEntity(String.class);
				log.error("Group creation failed. Status: {} Error: {}", response.getStatus(), errorMessage);
				throw new KeycloakIntegrationException("Failed to create group: " + errorMessage, "GROUP_CREATION_ERROR");
			}
			return extractGroupId(response);
		} catch (KeycloakIntegrationException e) {
			log.error("Group creation error: {}", e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error("Unexpected error during group creation", e);
			throw new KeycloakIntegrationException("Failed to extract group ID", "GROUP_ID_EXTRACTION_ERROR");
		}
	}

	private String extractGroupId(Response response) {
		if (response == null) {
			throw new KeycloakIntegrationException("Failed to extract group ID", "GROUP_ID_EXTRACTION_ERROR");
		}

		String locationHeader = response.getHeaderString("Location");
		if (locationHeader == null || !locationHeader.contains("/")) {
			log.error("Group creation failed: Missing 'Location' header in response.");
			throw new KeycloakIntegrationException("Failed to extract group ID", "GROUP_ID_EXTRACTION_ERROR");
		}

		return locationHeader.substring(locationHeader.lastIndexOf("/") + 1);
	}

	private String getOrCreateGroup(String groupName) {
		return findGroupByName(groupName).map(GroupRepresentation::getId).orElseGet(() -> createGroup(groupName));
	}

	private void addUserToGroup(String userId, String groupId) {
		getUsersResource().get(userId).joinGroup(groupId);
		log.info("User added to group: {}", groupId);
	}

	public UserManagementDto getCurrentUser(String authHeader) {
		return Optional.ofNullable(authHeader)
				.filter(header -> header.startsWith(BEARER_PREFIX))
				.map(header -> {
					try {
						return jwtTokenProvider.parseToken(header.substring(7));
					} catch (IllegalArgumentException e) {
						log.error("Error parsing JWT token: {}", e.getMessage());
						return null;
					}
				})
				.map(claims -> new UserManagementDto(
						(String) claims.get("sub"),
						(String) claims.get("name"),
						(String) claims.get("email"),
						(String) claims.get("given_name"),
						(String) claims.get("family_name"),
						extractOrganizationInfo(claims)
				))
				.orElse(null);
	}

	private Map<String, String> extractOrganizationInfo(Map<String, Object> claims) {
		return Optional.ofNullable(claims)
				.map(attrs -> (Map<String, List<String>>) attrs.get("attributes"))
				.map(attrs -> attrs.get("organizationRegistrationNumber"))
				.filter(list -> !list.isEmpty())
				.map(list -> Collections.singletonMap("organizationRegistrationNumber", list.getFirst()))
				.orElse(Collections.emptyMap());
	}

	private void validateUserRegistration(UserRegistrationDto dto) {
		dto.getCredentials().forEach(this::validateCredentials);
		validateOrganizationNumber(dto.getAttributes());
		validateUserUniqueness(dto);
	}

	private void validateUserUniqueness(UserRegistrationDto dto) {
		UsersResource usersResource = getUsersResource();
		if (!usersResource.search(dto.getUsername()).isEmpty() || !usersResource.search(dto.getEmail()).isEmpty()) {
			throw new UserUniqueException("Username or Email already exists");
		}
	}

	private void validateCredentials(CredentialDto credentials) {
		passwordValidator.validate(credentials.getValue());
	}

	private void validateOrganizationNumber(Map<String, String> attributes) {
		String orgNumber = Optional.ofNullable(attributes).map(attrs -> attrs.get("organizationRegistrationNumber"))
				.orElseThrow(() -> new UserValidationException("Organization registration number is required"));

		if (!orgNumber.matches(ORG_NUMBER_REGEX) || !companyRegisterService.existsByRegistrationNumber(orgNumber)) {
			throw new UserValidationException("Invalid or non-existent organization registration number");
		}
	}

	private UsersResource getUsersResource() {
		return keycloak.realm(keycloakProperties.getRealm()).users();
	}

	private String extractUserId(Response response) {
		try {
			if (response.getLocation() == null) {
				throw new KeycloakIntegrationException("Failed to extract user ID", "USER_ID_EXTRACTION_ERROR");
			}
			return response.getLocation().getPath().replaceAll(".*/", "");
		} catch (Exception e) {
			throw new KeycloakIntegrationException("Failed to extract user ID", "USER_ID_EXTRACTION_ERROR");
		}
	}
}
