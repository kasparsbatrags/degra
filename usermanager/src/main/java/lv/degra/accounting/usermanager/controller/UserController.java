package lv.degra.accounting.usermanager.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_LOGIN;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_LOGOUT;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_REFRESH;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_REGISTER;
import static lv.degra.accounting.core.config.ApiConstants.PATH_USER;
import static lv.degra.accounting.usermanager.config.UserManagerConstants.BEARER_PREFIX;

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
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.config.dto.ApiResponse;
import lv.degra.accounting.core.user.dto.UserRegistrationDto;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.UserUniqueException;
import lv.degra.accounting.core.user.exception.UserValidationException;
import lv.degra.accounting.usermanager.service.AuthService;
import lv.degra.accounting.usermanager.service.AuthUserService;

@Slf4j
@RestController
@RequestMapping(PATH_USER)
public class UserController {

    private static final String SUCCESS_MESSAGE = "Darbība veiksmīga";
    private static final String ERROR_MESSAGE = "Kļūda";

	private final AuthUserService authUserService;
	private final AuthService authService;

	@Autowired
	public UserController(AuthUserService authUserService, AuthService authService) {
		this.authUserService = authUserService;
		this.authService = authService;
	}

    @PostMapping(value = ENDPOINT_REGISTER, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse> createUser(@Valid @RequestBody UserRegistrationDto userRegistrationDto) {
        try {
            authUserService.createUser(userRegistrationDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Lietotājs veiksmīgi izveidots"));
        } catch (UserValidationException | UserUniqueException e) {
            log.warn("Lietotāja validācijas kļūda: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (KeycloakIntegrationException e) {
            log.error("Keycloak integrācijas kļūda: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Neizdevās izveidot lietotāju: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Neparedzēta kļūda lietotāja izveidē: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Radās neparedzēta kļūda"));
        }
    }

    @PostMapping(value = ENDPOINT_LOGIN, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "E-pasts un parole ir obligāti"));
            }

            Map<String, Object> token = authService.login(email, password);
            return ResponseEntity.ok(new ApiResponse(true, "Veiksmīga autentifikācija", token));
        } catch (Exception e) {
            log.warn("Neveiksmīgs pieteikšanās mēģinājums: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Nepareizs e-pasts vai parole"));
        }
    }

    @PostMapping(ENDPOINT_LOGOUT)
    public ResponseEntity<ApiResponse> logout(@RequestBody Map<String, String> tokens) {
        try {
            String refreshToken = tokens.get("refreshToken");
            if (refreshToken == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "Atjaunošanas tokens ir obligāts"));
            }

            authService.logout(refreshToken);
            return ResponseEntity.ok(new ApiResponse(true, "Veiksmīga izrakstīšanās"));
        } catch (Exception e) {
            log.error("Kļūda izrakstīšanās laikā: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Neizdevās izrakstīties: " + e.getMessage()));
        }
    }

    @PostMapping(ENDPOINT_REFRESH)
    public ResponseEntity<ApiResponse> refreshToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String bearerToken) {
        try {
            if (!bearerToken.startsWith(BEARER_PREFIX)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Nederīgs tokena formāts"));
            }

            Map<String, Object> tokens = authService.refreshTokenIfExpired(bearerToken);
            return ResponseEntity.ok(new ApiResponse(true, "Tokens veiksmīgi atjaunots", tokens));

        } catch (KeycloakIntegrationException e) {
            log.warn("Tokena atjaunošanas kļūda: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            log.error("Neparedzēta kļūda tokena atjaunošanā: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Neizdevās atjaunot tokenu"));
        }
    }
}
