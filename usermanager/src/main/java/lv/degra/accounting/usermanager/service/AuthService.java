package lv.degra.accounting.usermanager.service;

import static lv.degra.accounting.usermanager.config.UserManagerConstants.BEARER_PREFIX;

import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.user.exception.InvalidTokenException;
import lv.degra.accounting.core.user.exception.KeycloakIntegrationException;
import lv.degra.accounting.core.user.exception.TokenExpiredException;
import lv.degra.accounting.core.user.exception.UserSaveException;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.model.UserRepository;
import lv.degra.accounting.usermanager.client.KeycloakProperties;
import lv.degra.accounting.usermanager.client.KeycloakTokenClient;

@Service
@Slf4j
public class AuthService {

    private final KeycloakTokenClient keycloakTokenClient;
    private final KeycloakProperties keycloakProperties;
    private final UserRepository userRepository;
    private final JwtDecoder jwtDecoder;
    private final MeterRegistry meterRegistry;
    private final ObjectMapper objectMapper;

    private static final String METRIC_AUTH_ATTEMPTS = "auth.attempts";
    private static final String METRIC_AUTH_FAILURES = "auth.failures";
    private static final String METRIC_TOKEN_REFRESHES = "auth.token.refreshes";

    @Autowired
    public AuthService(
            KeycloakTokenClient keycloakTokenClient,
            KeycloakProperties keycloakProperties,
            UserRepository userRepository,
            JwtDecoder jwtDecoder,
            MeterRegistry meterRegistry) {
        this.keycloakTokenClient = keycloakTokenClient;
        this.keycloakProperties = keycloakProperties;
        this.userRepository = userRepository;
        this.jwtDecoder = jwtDecoder;
        this.meterRegistry = meterRegistry;
        this.objectMapper = new ObjectMapper();
    }

    @Cacheable(value = "keycloakTokens", key = "#root.methodName")
    public String getAccessToken() {
        MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
        request.add("grant_type", "client_credentials");
        request.add("client_id", keycloakProperties.getClientId());
        request.add("client_secret", keycloakProperties.getClientSecret());

        try {
            Map<String, Object> response = keycloakTokenClient.getAccessToken(
                    MediaType.APPLICATION_FORM_URLENCODED_VALUE, request);
            String token = (String) response.get("access_token");
            validateToken(token);
            return token;
        } catch (Exception e) {
            log.error("Unable to get access token from Keycloak: {}", e.getMessage());
            meterRegistry.counter(METRIC_AUTH_FAILURES).increment();
            throw new KeycloakIntegrationException("Authentication error", "AUTH_ERROR");
        }
    }

    public Map<String, Object> login(String email, String password) {
        meterRegistry.counter(METRIC_AUTH_ATTEMPTS).increment();
        MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
        request.add("grant_type", "password");
        request.add("client_id", keycloakProperties.getClientId());
        request.add("client_secret", keycloakProperties.getClientSecret());
        request.add("username", email);
        request.add("password", password);

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> tokenResponse = keycloakTokenClient.getAccessToken(
                    MediaType.APPLICATION_JSON_VALUE, request);
            
            String accessToken = tokenResponse.get("access_token").toString();
            validateToken(accessToken);
            
            String sub = extractSub(accessToken);
            String refreshToken = tokenResponse.get("refresh_token").toString();

            saveOrUpdateUser(sub, refreshToken);

            response.put("access_token", accessToken);
            response.put("expires_in", tokenResponse.get("expires_in"));
            response.put("token_type", tokenResponse.get("token_type"));
            return response;
        } catch (Exception e) {
            log.error("Neizdevās autentificēt lietotāju ar e-pastu: {}", email, e);
            meterRegistry.counter(METRIC_AUTH_FAILURES).increment();
            throw new KeycloakIntegrationException("Invalid credentials", "AUTH_ERROR");
        }
    }

    @CacheEvict(value = "keycloakTokens", allEntries = true)
    public void logout(String refreshToken) {
        MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
        request.add("client_id", keycloakProperties.getClientId());
        request.add("client_secret", keycloakProperties.getClientSecret());
        request.add("refresh_token", refreshToken);

        try {
            keycloakTokenClient.logout(MediaType.APPLICATION_FORM_URLENCODED_VALUE, request);
        } catch (Exception e) {
            log.error("Neizdevās izrakstīt lietotāju", e);
            throw new KeycloakIntegrationException("Logout failed", "LOGOUT_ERROR");
        }
    }

    @CacheEvict(value = "keycloakTokens", allEntries = true)
    public Map<String, Object> refreshTokenIfExpired(String bearerToken) {
        meterRegistry.counter(METRIC_TOKEN_REFRESHES).increment();
        try {
            String token = bearerToken.replace(BEARER_PREFIX, "");
            String userId = getUserIdFromToken(token);
            
            User user = userRepository.findByUserId(userId)
                    .orElseThrow(() -> new KeycloakIntegrationException("User not found", "USER_NOT_FOUND"));

            try {
                Map<String, Object> tokenResponse = keycloakTokenClient.getAccessToken(
                        MediaType.APPLICATION_FORM_URLENCODED_VALUE,
                        createRefreshRequest(user.getRefreshToken())
                );

                String newAccessToken = (String) tokenResponse.get("access_token");
                validateToken(newAccessToken);

                if (tokenResponse.containsKey("refresh_token")) {
                    user.setRefreshToken((String) tokenResponse.get("refresh_token"));
                    userRepository.save(user);
                }

                Map<String, Object> response = new HashMap<>();
                response.put("access_token", newAccessToken);
                response.put("expires_in", tokenResponse.get("expires_in"));
                response.put("token_type", tokenResponse.get("token_type"));
                return response;

            } catch (Exception e) {
                log.error("Failed to refresh token, clearing user session: {}", e.getMessage());

                user.setRefreshToken(null);
                userRepository.save(user);
                throw new TokenExpiredException("Session expired, please login again");
            }

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw new KeycloakIntegrationException("Token refresh failed", "REFRESH_ERROR");
        }
    }

    private String getUserIdFromToken(String token) {
        try {
            String[] chunks = token.split("\\.");
            if (chunks.length < 2) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }

            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));
            Map<String, Object> claims = objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
            return (String) claims.get("sub");
        } catch (Exception e) {
            log.error("Failed to extract userId from token: {}", e.getMessage());
            throw new InvalidTokenException("Failed to extract userId from token");
        }
    }

    private void validateToken(String token) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            Instant expiration = jwt.getExpiresAt();
            if (expiration != null && expiration.isBefore(Instant.now())) {
                throw new TokenExpiredException("Token has expired");
            }
        } catch (TokenExpiredException e) {
            throw e;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            throw new InvalidTokenException("Invalid token format or signature");
        }
    }

    private MultiValueMap<String, String> createRefreshRequest(String refreshToken) {
        MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
        request.add("grant_type", "refresh_token");
        request.add("client_id", keycloakProperties.getClientId());
        request.add("client_secret", keycloakProperties.getClientSecret());
        request.add("refresh_token", refreshToken);
        return request;
    }

    private String extractSub(String accessToken) {
        try {
            Jwt jwt = jwtDecoder.decode(accessToken);
            return jwt.getSubject();
        } catch (Exception e) {
            log.error("Failed to extract subject from token: {}", e.getMessage());
            throw new InvalidTokenException("Failed to extract subject from token");
        }
    }

    private void saveOrUpdateUser(String userId, String refreshToken) {
        try {
            User user = userRepository.findByUserId(userId)
                    .orElse(new User());
            user.setUserId(userId);
            user.setRefreshToken(refreshToken);
            user.setLastLoginTime(Instant.now());
            userRepository.save(user);
        } catch (Exception e) {
            log.error("Neizdevās saglabāt lietotāja informāciju: {}", e.getMessage());
            throw new UserSaveException("Neizdevās saglabāt lietotāja informāciju", "USER_SAVE_ERROR");
        }
    }
}
