package lv.degra.accounting.freighttracking.config.security;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTES;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUC_OBJECT;
import static lv.degra.accounting.core.config.ApiConstants.PATH_FREIGHT_TRACKING;
import static lv.degra.accounting.core.config.ApiConstants.USER_ROLE_NAME;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
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
        http.securityMatcher(PATH_FREIGHT_TRACKING + "/**")
            .cors(cors -> cors.configurationSource(freightTrackingCorsConfigurationSource()))
            .csrf(csrf -> {
                log.info("Disabling CSRF");
                csrf.disable();
            })
            .authorizeHttpRequests(authz -> 
                authz.requestMatchers(PATH_FREIGHT_TRACKING + ENDPOINT_TRUCK_ROUTES + "/**").hasAuthority(USER_ROLE_NAME)
						.requestMatchers(PATH_FREIGHT_TRACKING + ENDPOINT_TRUC_OBJECT+ "/**").hasAuthority(USER_ROLE_NAME)
                    .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> {
                log.info("Configuring OAuth2 Resource Server");
                oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()));
            })
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        return converter;
    }

    class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
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

            return roles.stream()
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();
        }
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
