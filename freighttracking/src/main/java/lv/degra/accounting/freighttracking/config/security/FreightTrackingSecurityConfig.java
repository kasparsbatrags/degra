package lv.degra.accounting.freighttracking.config.security;

import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING;
import static lv.degra.accounting.core.config.ApiConstants.TRUCK_ROUTES;

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
public class FreightTrackingSecurityConfig {

	@Bean
	public SecurityFilterChain freightTrackingSecurityFilterChain(HttpSecurity http) throws Exception {
		http.securityMatcher(FREIGHT_TRACKING + "/**").cors(cors -> cors.configurationSource(freightTrackingCorsConfigurationSource()))
				.csrf(csrf -> {
					log.info("Disabling CSRF");
					csrf.disable();
				}).authorizeHttpRequests(
						authz -> authz.requestMatchers(FREIGHT_TRACKING + TRUCK_ROUTES + "/**").hasRole("USER").anyRequest().authenticated())
				.oauth2ResourceServer(oauth2 -> {
					log.info("Configuring OAuth2 Resource Server");
					oauth2.jwt(jwt -> {
						log.info("JWT validation temporarily disabled for debugging");
					});
				}).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		return http.build();
	}

	@Bean
	public CorsConfigurationSource freightTrackingCorsConfigurationSource() {
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