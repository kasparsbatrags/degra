package lv.degra.accounting.usermanager.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		logger.info("Configuring SecurityFilterChain");

		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> {
					logger.info("Disabling CSRF");
					csrf.disable();
				})
				.authorizeHttpRequests(authz -> {
					logger.info("Configuring authorization rules");
					authz
							.requestMatchers("/api/user/**").permitAll()
							.requestMatchers("/api/public/**").permitAll()
							.anyRequest().authenticated();
				})
				.oauth2ResourceServer(oauth2 -> {
					logger.info("Configuring OAuth2 Resource Server");
					oauth2.jwt(jwt -> {
						// Temporarily disable JWT validation for debugging
						logger.info("JWT validation temporarily disabled for debugging");
					});
				})
				.sessionManagement(session -> {
					logger.info("Setting session management to STATELESS");
					session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
				});

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		logger.info("Configuring CORS");
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.addAllowedOrigin("*");  // Not recommended for production
		configuration.addAllowedMethod("*");
		configuration.addAllowedHeader("*");

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}