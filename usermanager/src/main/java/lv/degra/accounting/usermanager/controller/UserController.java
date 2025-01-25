package lv.degra.accounting.usermanager.controller;

import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lv.degra.accounting.core.user.dto.UserDto;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.usermanager.service.AuthService;
import lv.degra.accounting.usermanager.service.AuthUserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

	private final AuthUserService authUserService;
	private final AuthService authService;

	@Autowired
	public UserController(AuthUserService authUserService, AuthService authService) {
		this.authUserService = authUserService;
		this.authService = authService;
	}

	@PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
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

	@GetMapping("/me")
	public ResponseEntity<UserDto> getCurrentUser(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
		try {

			if (!authorizationHeader.startsWith("Bearer ")) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			}

			String token = authorizationHeader.substring(7);
			UserDto userInfo = authUserService.getCurrentUser(token);

			if (userInfo == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			}

			return ResponseEntity.ok(userInfo);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new UserDto(null, null, null, "Invalid or expired token", null, null));
		}
	}

	@PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
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

	@PostMapping("/logout")
	public ResponseEntity<String> logout(@RequestBody Map<String, String> tokens) {
		try {
			String refreshToken = tokens.get("refreshToken");
			authService.logout(refreshToken);
			return ResponseEntity.noContent().build();
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Logout failed: " + e.getMessage());
		}
	}

}
