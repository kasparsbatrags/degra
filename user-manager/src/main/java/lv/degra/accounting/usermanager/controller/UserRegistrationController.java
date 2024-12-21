package lv.degra.accounting.usermanager.controller;

import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lv.degra.accounting.core.user.KeycloakUserService;
import lv.degra.accounting.core.user.UserRegistrationDto;

@RestController
@RequestMapping("/api/users")
public class UserRegistrationController {

	private final KeycloakUserService keycloakUserService;

	@Autowired
	public UserRegistrationController(KeycloakUserService keycloakUserService) {
		this.keycloakUserService = keycloakUserService;
	}

	@PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, String>> createUser(@Valid @RequestBody UserRegistrationDto userRegistrationDto) {
		try {
			keycloakUserService.createUser(userRegistrationDto);
			return ResponseEntity.ok(Collections.singletonMap("message", "User created successfully!"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Failed to create user: " + e.getMessage()));
		}
	}

	@GetMapping("/info")
	public ResponseEntity<String> geInfo() {
		try {
			return ResponseEntity.ok("Ok!");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Failed info!" + e.getMessage());
		}
	}

}
