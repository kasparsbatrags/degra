package lv.degra.accounting.usermanager.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_LOGIN;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_LOGOUT;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_REFRESH;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_REGISTER;
import static lv.degra.accounting.core.config.ApiConstants.PATH_USER;
import static lv.degra.accounting.usermanager.service.AuthUserService.BEARER_PREFIX;

import java.util.Collections;
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

import jakarta.validation.Valid;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.usermanager.service.AuthService;
import lv.degra.accounting.usermanager.service.AuthUserService;

@RestController
@RequestMapping(PATH_USER)
public class UserController {

	private final AuthUserService authUserService;
	private final AuthService authService;

	@Autowired
	public UserController(AuthUserService authUserService, AuthService authService) {
		this.authUserService = authUserService;
		this.authService = authService;
	}

	@PostMapping(value = ENDPOINT_REGISTER, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, String>> createUser(@Valid @RequestBody UserRegistrationDto userRegistrationDto) {
		try {
			authUserService.createUser(userRegistrationDto);
			return ResponseEntity.status(HttpStatus.CREATED)
					.body(Collections.singletonMap("message", "User created successfully!"));
		} catch (UserValidationException | UserUniqueException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(Collections.singletonMap("error", e.getMessage()));
		} catch (KeycloakIntegrationException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Collections.singletonMap("error", "Failed to create user: " + e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Collections.singletonMap("error", "An unexpected error occurred"));
		}
	}

	@PostMapping(value = ENDPOINT_LOGIN, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
		try {
			String email = credentials.get("email");
			String password = credentials.get("password");

			Map<String, Object> token = authService.login(email, password);

			return ResponseEntity.ok(token);
		} catch (Exception e) {
			return ResponseEntity.status(401).body(Collections.singletonMap("message", "Unauthorized: " + e.getMessage()));
		}
	}

	@PostMapping(ENDPOINT_LOGOUT)
	public ResponseEntity<String> logout(@RequestBody Map<String, String> tokens) {
		try {
			String refreshToken = tokens.get("refreshToken");
			authService.logout(refreshToken);
			return ResponseEntity.noContent().build();
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Logout failed: " + e.getMessage());
		}
	}

	@PostMapping(ENDPOINT_REFRESH)
	public ResponseEntity<?> refreshToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String bearerToken) {
		try {
			if (!bearerToken.startsWith(BEARER_PREFIX)) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Collections.singletonMap("error", "Invalid token format"));
			}

			Map<String, Object> tokens = authService.refreshTokenIfExpired(bearerToken);
			return ResponseEntity.ok(tokens);

		} catch (KeycloakIntegrationException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Collections.singletonMap("error", e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Collections.singletonMap("error", "Token refresh failed"));
		}
	}
}
