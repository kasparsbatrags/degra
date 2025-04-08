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
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.user.authorize.service.AuthService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class FreightTrackingSecurityConfig {

    @Value("${app.security.allowed-origins}")
    private List<String> allowedOrigins;

    @Value("${spring.profiles.active:}")
    private String activeProfile;
    
    private final AuthService authService;

    @Autowired
    public FreightTrackingSecurityConfig(AuthService authService) {
        this.authService = authService;
    }

    @Bean
    public SecurityFilterChain freightTrackingSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(FREIGHT_TRACKING_PATH + "/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> {
                if (!"production".equalsIgnoreCase(activeProfile)) {
                    log.info("Disabling CSRF for non-production environment");
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
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(FREIGHT_TRACKING_PATH + ENDPOINT_TRUCK_ROUTES + "/**").hasAuthority(USER_ROLE_NAME)
                .requestMatchers(FREIGHT_TRACKING_PATH + ENDPOINT_TRUCK_OBJECT + "/**").hasAuthority(USER_ROLE_NAME)
                .requestMatchers(FREIGHT_TRACKING_PATH + ENDPOINT_CARGO_TYPES + "/**").hasAuthority(USER_ROLE_NAME)
                // Allow Swagger UI and OpenAPI resources
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/swagger-ui.html").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(tokenRefreshFilter(), SecurityContextHolderFilter.class)
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }

    @Bean
    public OncePerRequestFilter tokenRefreshFilter() {
        return new TokenRefreshFilter(authService);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new ImprovedRoleConverter());
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("Configuring CORS with allowed origins: {}", allowedOrigins);
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.addAllowedHeader("x-platform");
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Tokenu atjaunošanas filtrs, kas automātiski atjauno beidzošos JWT tokenus
     */
    @Slf4j
    public static class TokenRefreshFilter extends OncePerRequestFilter {
        
        private final AuthService authService;
        
        public TokenRefreshFilter(AuthService authService) {
            this.authService = authService;
        }
        
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                FilterChain filterChain) throws ServletException, IOException {
            try {
                String token = request.getHeader("Authorization");
                if (token != null && token.startsWith(BEARER_PREFIX)) {
                    token = token.substring(7);
                    try {
                        // Mēģinām dekodēt tokenu, lai pārbaudītu tā derīgumu
                        // Šeit mēs paļaujamies uz to, ka Spring Security JwtDecoder
                        // tiks automātiski konfigurēts no application.yaml iestatījumiem
                        // un tiks izmantots, kad mēs nonāksim līdz OAuth2 Resource Server filtram
                        
                        // Pārbaudām, vai tokens nav beidzies, izmantojot parseToken metodi
                        Map<String, Object> claims = parseToken(token);
                        long exp = ((Number) claims.get("exp")).longValue();
                        if (exp * 1000 < System.currentTimeMillis()) {
                            log.info("Token has expired, attempting refresh");
                            Map<String, Object> newTokens = authService.refreshTokenIfExpired(token);
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
                    } catch (Exception e) {
                        log.info("Token validation failed, attempting refresh: {}", e.getMessage());
                        try {
                            Map<String, Object> newTokens = authService.refreshTokenIfExpired(token);
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
                        } catch (Exception refreshError) {
                            log.error("Error refreshing token: {}", refreshError.getMessage(), refreshError);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error checking token: {}", e.getMessage(), e);
            }
            filterChain.doFilter(request, response);
        }
        
        private Map<String, Object> parseToken(String token) {
            try {
                String[] chunks = token.split("\\.");
                if (chunks.length < 2) {
                    throw new IllegalArgumentException("Invalid JWT token format");
                }

                java.util.Base64.Decoder decoder = java.util.Base64.getUrlDecoder();
                String payload = new String(decoder.decode(chunks[1]));
                return new com.fasterxml.jackson.databind.ObjectMapper().readValue(payload, 
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            } catch (IOException e) {
                throw new IllegalArgumentException("Invalid JWT token", e);
            }
        }
    }

    /**
     * Uzlabots lomu konvertētājs, kas mēģina iegūt lomas no vairākām vietām JWT tokenā
     */
    static class ImprovedRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            List<String> roles = new java.util.ArrayList<>();
            
            // 1. Mēģina iegūt lomas no resource_access.{client}.roles (visi klienti)
            try {
                Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
                if (resourceAccess != null) {
                    resourceAccess.forEach((client, access) -> {
                        if (access instanceof Map) {
                            Map<String, Object> clientAccess = (Map<String, Object>) access;
                            if (clientAccess.containsKey("roles")) {
                                List<String> clientRoles = (List<String>) clientAccess.get("roles");
                                if (clientRoles != null) {
                                    roles.addAll(clientRoles);
                                }
                            }
                        }
                    });
                }
            } catch (Exception e) {
                // Ignorējam kļūdas, ja nevar iegūt resource_access.{client}.roles
            }
            
            // 2. Mēģina iegūt lomas no realm_access.roles
            try {
                Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
                if (realmAccess != null && realmAccess.containsKey("roles")) {
                    List<String> realmRoles = (List<String>) realmAccess.get("roles");
                    if (realmRoles != null) {
                        roles.addAll(realmRoles);
                    }
                }
            } catch (Exception e) {
                // Ignorējam kļūdas, ja nevar iegūt realm_access.roles
            }
            
            // 3. Mēģina iegūt lomas no "groups" claim (atpakaļsaderība)
            List<String> groups = jwt.getClaimAsStringList("groups");
            if (groups != null) {
                roles.addAll(groups);
            }
            
            // 4. Mēģina iegūt lomas no "roles" claim (atpakaļsaderība)
            List<String> directRoles = jwt.getClaimAsStringList("roles");
            if (directRoles != null) {
                roles.addAll(directRoles);
            }
            
            // Konvertē lomas uz GrantedAuthority objektiem
            return roles.stream()
                .distinct() // Noņem dublikātus
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        }
    }
}
