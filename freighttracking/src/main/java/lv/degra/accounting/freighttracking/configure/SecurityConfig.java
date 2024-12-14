package lv.degra.accounting.freighttracking.configure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true) // Enables method-level security annotations
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(csrf -> csrf.disable()) // Disable CSRF for APIs
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/freight/public/**").permitAll() // Public access
						.requestMatchers("/api/freight/admin/**").hasRole("ADMIN") // Role-based access
						.requestMatchers("/api/freight/user/**").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/api/freight/mobile-user/**").hasAnyRole("MOBILE_USER", "ADMIN")
						.anyRequest().authenticated() // All other requests must be authenticated
				)
				.oauth2ResourceServer(oauth2 -> oauth2
						.jwt(jwtConfigurer -> jwtConfigurer
								.jwkSetUri("https://route.degra.lv/realms/freight-tracking-app-realm/protocol/openid-connect/certs")
								.jwtAuthenticationConverter(jwtAuthenticationConverter()) // Custom role handling
						)
				)
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint((request, response, authException) -> {
							response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: " + authException.getMessage());
						})
						.accessDeniedHandler((request, response, accessDeniedException) -> {
							response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden: " + accessDeniedException.getMessage());
						})
				);
		return http.build();
	}

	@Bean
	public JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
		grantedAuthoritiesConverter.setAuthorityPrefix(""); // Remove ROLE_ prefix if Keycloak doesn't use it
		grantedAuthoritiesConverter.setAuthoritiesClaimName("roles"); // Use the "roles" claim from JWT

		JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
		authenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
		return authenticationConverter;
	}
}
