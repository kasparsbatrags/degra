package lv.degra.accounting.core.user.client;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import lv.degra.accounting.core.user.dto.UserRegistrationDto;

@FeignClient(
		name = "keycloak",
		url = "${keycloak.auth-server-url}/admin/realms/${keycloak.realm}")
public interface KeycloakAdminClient {

	@PostMapping(value = "/users", consumes = MediaType.APPLICATION_JSON_VALUE)
	void createUser(
			@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
			@RequestBody UserRegistrationDto userPayload
	);

	@GetMapping(value = "/userinfo", consumes = MediaType.APPLICATION_JSON_VALUE)
	Map<String, Object> getUserInfo(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization);

}
