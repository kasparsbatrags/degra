package lv.degra.accounting.usermanager.config;

import static lv.degra.accounting.core.config.ApiConstants.LOGIN_URL;
import static lv.degra.accounting.core.config.ApiConstants.PUBLIC_URL;
import static lv.degra.accounting.core.config.ApiConstants.REGISTER_URL;
import static lv.degra.accounting.core.config.ApiConstants.USER_ENDPOINT;

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

import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.securityMatcher(USER_ENDPOINT + "/**")
				.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(csrf -> {
					log.info("Disabling CSRF");
					csrf.disable();
				}).authorizeHttpRequests(
						authz -> authz
								.requestMatchers(USER_ENDPOINT + LOGIN_URL).permitAll()
								.requestMatchers(USER_ENDPOINT + REGISTER_URL).permitAll()
								.requestMatchers(USER_ENDPOINT + PUBLIC_URL + "**").permitAll().anyRequest().authenticated()
				)
				.oauth2ResourceServer(oauth2 -> {
					log.info("Configuring OAuth2 Resource Server");
					oauth2.jwt(jwt -> {
						// Temporarily disable JWT validation for debugging
						log.info("JWT validation temporarily disabled for debugging");
					});
				}).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

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
}