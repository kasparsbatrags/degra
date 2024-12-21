package lv.degra.accounting.core.user.client;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "keycloak-token-client", url = "${keycloak.auth-server-url}/realms/${keycloak.realm}",
		configuration = FeignConfig.class)
public interface KeycloakTokenClient {

	@PostMapping(value = "/protocol/openid-connect/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	Map<String, Object> getAccessToken(
			@RequestHeader("Content-Type") String contentType,
			@RequestBody MultiValueMap<String, String> request
	);
}
