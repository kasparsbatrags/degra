package lv.degra.accounting.core.user.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Configuration
@Validated
@Getter
@Setter
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakProperties {
	private final int connectionTimeout = 5000;
	private final int readTimeout = 5000;
	@NotBlank
	@Value("${keycloak.auth-server-url}")
	private String authServerUrl;
	@NotBlank
	@Value("${keycloak.realm}")
	private String realm;
	@NotBlank
	@Value("${keycloak.resource}")
	private String clientId;
	@NotBlank
	@Value("${keycloak.credentials.secret}")
	private String clientSecret;
}