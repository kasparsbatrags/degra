package lv.degra.accounting.usermanager.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_LOGIN;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_LOGOUT;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_REFRESH;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_REGISTER;
import static lv.degra.accounting.core.config.ApiConstants.PATH_USER;
import static lv.degra.accounting.core.user.authorize.config.UserManagerConstants.BEARER_PREFIX;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.config.dto.ApiResponse;
import lv.degra.accounting.core.user.authorize.service.AuthService;
import lv.degra.accounting.core.user.authorize.service.AuthUserService;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;

@Slf4j
@RestController
@RequestMapping(PATH_USER)
@Tag(name = "User Management", description = "API for user registration, authentication and management")
public class UserController {

	private static final String SUCCESS_MESSAGE = "Operation successful";
	private static final String ERROR_MESSAGE = "Error";

	private final AuthUserService authUserService;
	private final AuthService authService;

	@Autowired
	public UserController(AuthUserService authUserService, AuthService authService) {
		this.authUserService = authUserService;
		this.authService = authService;
	}

	@Operation(summary = "Register a new user", description = "Creates a new user account with the provided details")
	@io.swagger.v3.oas.annotations.responses.ApiResponses(
			value = { @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User successfully created"),
					@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400",
							description = "Invalid input or validation error"),
					@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error") })
	@PostMapping(value = ENDPOINT_REGISTER, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ApiResponse> createUser(@Valid @RequestBody UserRegistrationDto userRegistrationDto) {
		try {
			authUserService.createUser(userRegistrationDto);
			return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse(true, "User successfully created"));
		} catch (UserValidationException | UserUniqueException e) {
			log.warn("User validation error: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, e.getMessage()));
		} catch (KeycloakIntegrationException e) {
			log.error("Keycloak integration error: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse(false, "Failed to create user: " + e.getMessage()));
		} catch (Exception e) {
			log.error("Unexpected error during user creation: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(false, "An unexpected error occurred"));
		}
	}

	@Operation(summary = "Login user", description = "Authenticates a user with email and password")
	@io.swagger.v3.oas.annotations.responses.ApiResponses(
			value = { @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Authentication successful"),
					@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Missing credentials"),
					@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials") })
	@PostMapping(value = ENDPOINT_LOGIN, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ApiResponse> login(@RequestBody Map<String, String> credentials) {
		try {
			String email = credentials.get("email");
			String password = credentials.get("password");

			if (email == null || password == null) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, "Email and password are required"));
			}

			Map<String, Object> token = authService.login(email, password);
			return ResponseEntity.ok(new ApiResponse(true, "Authentication successful", token));
		} catch (Exception e) {
			log.warn("Failed login attempt: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Invalid email or password"));
		}
	}

	@Operation(summary = "Logout user", description = "Logs out a user by invalidating their refresh token")
	@io.swagger.v3.oas.annotations.responses.ApiResponses(
			value = { @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful"),
					@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Missing refresh token"),
					@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error during logout") })
	@PostMapping(ENDPOINT_LOGOUT)
	public ResponseEntity<ApiResponse> logout(@RequestBody Map<String, String> tokens) {
		try {
			String refreshToken = tokens.get("refreshToken");
			if (refreshToken == null) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, "Refresh token is required"));
			}

			authService.logout(refreshToken);
			return ResponseEntity.ok(new ApiResponse(true, "Logout successful"));
		} catch (Exception e) {
			log.error("Error during logout: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse(false, "Failed to logout: " + e.getMessage()));
		}
	}

	@Operation(summary = "Refresh token", description = "Refreshes an expired JWT token using the refresh token")
	@io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
			@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token successfully refreshed"),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired token"),
			@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error during token refresh") })
	@PostMapping(ENDPOINT_REFRESH)
	public ResponseEntity<ApiResponse> refreshToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String bearerToken) {
		try {
			if (!bearerToken.startsWith(BEARER_PREFIX)) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Invalid token format"));
			}

			Map<String, Object> tokens = authService.refreshTokenIfExpired(bearerToken);
			return ResponseEntity.ok(new ApiResponse(true, "Token successfully refreshed", tokens));

		} catch (KeycloakIntegrationException e) {
			log.warn("Token refresh error: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, e.getMessage()));
		} catch (Exception e) {
			log.error("Unexpected error during token refresh: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(false, "Failed to refresh token"));
		}
	}
}
