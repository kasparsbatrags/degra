package lv.degra.accounting.usermanager.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "keycloak-admin", url = "https://route.degra.lv")
public interface KeycloakAdminClient {

	@PostMapping("/realms/freight-tracking-app-realm/users")
	String createUser(@RequestHeader("Authorization") String token, @RequestBody Object user);
}
