package lv.degra.accounting.freighttracking.configure.security;

import static lv.degra.accounting.freighttracking.configure.ApiConstants.TRUCK_ROUTES;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class SecurityConfig {


	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		log.info("Configuring SecurityFilterChain");

		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> {
					log.info("Disabling CSRF");
					csrf.disable();
				})
				.authorizeHttpRequests(authz -> {
					log.info("Configuring authorization rules");
					authz
							.requestMatchers("/api/freight/**").permitAll()
							.requestMatchers("/api/freight/public/**").permitAll()
							.requestMatchers("/api/freight/user/**").hasRole("MOBILE_USER")
							.requestMatchers(TRUCK_ROUTES+"/**").hasRole("MOBILE_USER")
							.anyRequest().authenticated();
				})
				.oauth2ResourceServer(oauth2 -> {
					log.info("Configuring OAuth2 Resource Server");
					oauth2.jwt(jwt -> {
						// Temporarily disable JWT validation for debugging
						log.info("JWT validation temporarily disabled for debugging");
					});
				})
				.sessionManagement(session -> {
					log.info("Setting session management to STATELESS");
					session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
				});

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		log.info("Configuring CORS");
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.addAllowedOrigin("*");  // Not recommended for production
		configuration.addAllowedMethod("*");
		configuration.addAllowedHeader("*");

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}


	@Bean
	public JwtDecoder jwtDecoder() {
		return NimbusJwtDecoder.withJwkSetUri("https://route.degra.lv/realms/freight-tracking-app-realm/protocol/openid-connect/certs")
				.build();
	}

}