package lv.degra.accounting.core.user.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import lv.degra.accounting.core.user.UserRegistrationDto;

@FeignClient(name = "keycloak", url = "${keycloak.auth-server-url}/realms/${keycloak.realm}", configuration = FeignConfig.class)
public interface KeycloakAdminClient {

	@PostMapping("/users")
	void createUser(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization, @RequestBody UserRegistrationDto userPayload);
}
