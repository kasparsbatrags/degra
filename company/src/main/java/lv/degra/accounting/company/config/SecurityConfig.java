package lv.degra.accounting.company.config;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_COMPANY;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class SecurityConfig {

	@Value("${app.security.allowed-origins}")
	private List<String> allowedOrigins;

	@Value("${keycloak.realm}")
	private String keycloakRealm;

	@Value("${keycloak.auth-server-url}")
	private String authServerUrl;

	@Value("${spring.profiles.active:}")
	private String activeProfile;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.securityMatcher(ENDPOINT_COMPANY + "/**")
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> {
					if (!"production".equalsIgnoreCase(activeProfile)) {
						csrf.disable();
					}
				})
				.headers(headers -> headers
						.frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
						.referrerPolicy(referrer -> referrer
								.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
						.contentSecurityPolicy(csp -> csp
								.policyDirectives("default-src 'self'; frame-ancestors 'none'; permissions-policy: camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), sync-xhr=(self)"))
				)
				.oauth2ResourceServer(oauth2 -> oauth2
						.jwt(jwt -> jwt.decoder(jwtDecoder()))
				)
				.sessionManagement(session ->
						session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
				);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		log.info("Configuring CORS with allowed origins: {}", allowedOrigins);
		CorsConfiguration configuration = new CorsConfiguration();
		// Use allowedOriginPatterns to avoid IllegalArgumentException with allowCredentials(true)
		configuration.setAllowedOriginPatterns(allowedOrigins);
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
		configuration.setExposedHeaders(List.of("Authorization"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public JwtDecoder jwtDecoder() {
		return NimbusJwtDecoder.withJwkSetUri(
						authServerUrl+ "/realms/" + keycloakRealm + "/protocol/openid-connect/certs")
				.build();
	}
}
