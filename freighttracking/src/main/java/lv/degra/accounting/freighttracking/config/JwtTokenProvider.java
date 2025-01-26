package lv.degra.accounting.freighttracking.config;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lv.degra.accounting.usermanager.service.AuthService;

@Service
public class JwtTokenProvider {

	private final JwtDecoder jwtDecoder;
	private final AuthService authService;

	@Autowired
	public JwtTokenProvider(JwtDecoder jwtDecoder, AuthService authService) {
		this.jwtDecoder = jwtDecoder;
		this.authService = authService;
	}

	public Map<String, Object> extractUserClaims(String token, String refreshToken) {
		try {
			Jwt jwt = jwtDecoder.decode(token);
			return jwt.getClaims();
		} catch (JwtException e) {
			if (e.getMessage().contains("expired")) {
				return handleExpiredToken(refreshToken);
			} else {
				throw e; // Citas kļūdas tiek pārsviestas augstāk.
			}
		}
	}

	private Map<String, Object> handleExpiredToken(String refreshToken) {
		Map<String, Object> tokenResponse = authService.refreshTokenIfExpired(refreshToken);
		try {
			String newToken = (String) tokenResponse.get("access_token");
			Jwt refreshedJwt = jwtDecoder.decode(newToken);
			return refreshedJwt.getClaims();
		} catch (JwtException ex) {
			throw new RuntimeException("Failed to decode refreshed token: " + ex.getMessage(), ex);
		}
	}

	public Map<String, Object> parseToken(String token) {
		String[] chunks = token.split("\\.");
		Base64.Decoder decoder = Base64.getUrlDecoder();

		String payload = new String(decoder.decode(chunks[1]));
		ObjectMapper objectMapper = new ObjectMapper();

		try {
			return objectMapper.readValue(payload, Map.class);
		} catch (IOException e) {
			throw new IllegalArgumentException("Invalid JWT token", e);
		}
	}

}
