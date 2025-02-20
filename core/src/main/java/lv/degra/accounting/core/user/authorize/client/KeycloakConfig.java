package lv.degra.accounting.core.user.authorize.client;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(KeycloakProperties.class)
public class KeycloakConfig {

	@Bean
	public Keycloak keycloak(KeycloakProperties keycloakProperties) {
		return KeycloakBuilder.builder().serverUrl(keycloakProperties.getAuthServerUrl()).realm(keycloakProperties.getRealm())
				.clientId(keycloakProperties.getClientId()).clientSecret(keycloakProperties.getClientSecret())
				.grantType("client_credentials").build();
	}

}