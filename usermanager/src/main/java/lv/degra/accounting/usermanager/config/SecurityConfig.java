package lv.degra.accounting.usermanager.config;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_LOGIN;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_PUBLIC;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_REGISTER;
import static lv.degra.accounting.core.config.ApiConstants.PATH_USER;

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
		http.securityMatcher(PATH_USER + "/**")
				.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(csrf -> {
					log.info("Disabling CSRF");
					csrf.disable();
				}).authorizeHttpRequests(
						authz -> authz
								.requestMatchers(PATH_USER + ENDPOINT_LOGIN).permitAll()
								.requestMatchers(PATH_USER + ENDPOINT_REGISTER).permitAll()
								.requestMatchers(PATH_USER + ENDPOINT_PUBLIC + "**").permitAll().anyRequest().authenticated()
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