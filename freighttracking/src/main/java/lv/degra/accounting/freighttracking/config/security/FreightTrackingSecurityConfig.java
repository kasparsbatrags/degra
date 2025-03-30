package lv.degra.accounting.freighttracking.config.security;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_CARGO_TYPES;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_OBJECT;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTES;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;
import static lv.degra.accounting.core.config.ApiConstants.USER_ROLE_NAME;
import static lv.degra.accounting.core.user.authorize.config.UserManagerConstants.BEARER_PREFIX;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.user.authorize.config.JwtTokenProvider;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class FreightTrackingSecurityConfig {

	private final JwtTokenProvider jwtTokenProvider;

	@Value("${app.security.allowed-origins}")
	private List<String> allowedOrigins;


	@Autowired
	public FreightTrackingSecurityConfig(JwtTokenProvider jwtTokenProvider) {
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@Bean
	public SecurityFilterChain freightTrackingSecurityFilterChain(HttpSecurity http) throws Exception {
		http.securityMatcher(FREIGHT_TRACKING_PATH + "/**")
				.cors(cors ->
						cors.configurationSource(freightTrackingCorsConfigurationSource()))
				.csrf(csrf -> {
					log.info("Disabling CSRF");
					csrf.disable();
				}).authorizeHttpRequests(
						authz -> authz.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
								.requestMatchers(FREIGHT_TRACKING_PATH + ENDPOINT_TRUCK_ROUTES + "/**").hasAuthority(USER_ROLE_NAME)
								.requestMatchers(FREIGHT_TRACKING_PATH + ENDPOINT_TRUCK_OBJECT + "/**").hasAuthority(USER_ROLE_NAME)
								.requestMatchers(FREIGHT_TRACKING_PATH + ENDPOINT_CARGO_TYPES + "/**").hasAuthority(USER_ROLE_NAME)
								.anyRequest().authenticated())
				.addFilterBefore(new OncePerRequestFilter() {
					@Override
					protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
							FilterChain filterChain) throws ServletException, IOException {
						try {
							String token = request.getHeader("Authorization");
							if (token != null && token.startsWith(BEARER_PREFIX)) {
								token = token.substring(7);
								try {
									jwtTokenProvider.validateToken(token);
								} catch (Exception e) {
									log.info("Token validation failed, attempting refresh");
									Map<String, Object> newTokens = jwtTokenProvider.refreshExpiredToken(token);
									if (newTokens != null && newTokens.containsKey("access_token")) {
										String newToken = (String) newTokens.get("access_token");
										response.setHeader("Authorization", BEARER_PREFIX + newToken);
										request = new HttpServletRequestWrapper(request) {
											@Override
											public String getHeader(String name) {
												if ("Authorization".equals(name)) {
													return BEARER_PREFIX + newToken;
												}
												return super.getHeader(name);
											}
										};
									}
								}
							}
						} catch (Exception e) {
							log.error("Error checking token: {}", e.getMessage(), e);
						}
						filterChain.doFilter(request, response);
					}
				}, SecurityContextHolderFilter.class).oauth2ResourceServer(oauth2 -> {
					log.info("Configuring OAuth2 Resource Server");
					oauth2.jwt(jwt -> jwt
						.jwtAuthenticationConverter(jwtAuthenticationConverter()));
				}).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		return http.build();
	}

	@Bean
	public JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
		return converter;
	}

	@Bean
	public CorsConfigurationSource freightTrackingCorsConfigurationSource() {
		log.info("Configuring CORS with allowed origins: {}", allowedOrigins);
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(allowedOrigins);
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
		configuration.setExposedHeaders(List.of("Authorization"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	static class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
		@Override
		public Collection<GrantedAuthority> convert(Jwt jwt) {
			Map<String, Object> realmAccess = jwt.getClaimAsMap("resource_access");
			if (realmAccess == null) {
				return List.of();
			}

			@SuppressWarnings("unchecked")
			Map<String, Object> clientAccess = (Map<String, Object>) realmAccess.get("freight-tracking-client");
			if (clientAccess == null) {
				return List.of();
			}

			@SuppressWarnings("unchecked")
			List<String> roles = (List<String>) clientAccess.get("roles");
			if (roles == null) {
				return List.of();
			}

			return roles.stream().map(SimpleGrantedAuthority::new).map(GrantedAuthority.class::cast).toList();
		}
	}

}
