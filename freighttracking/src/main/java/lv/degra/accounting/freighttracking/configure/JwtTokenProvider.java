package lv.degra.accounting.freighttracking.configure;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import lv.degra.accounting.usermanager.service.AuthService;

@Service
@ComponentScan(basePackages = "lv.degra.accounting.usermanager.service")
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
		String newToken = authService.refreshTokenIfExpired(refreshToken);
		try {
			Jwt refreshedJwt = jwtDecoder.decode(newToken);
			return refreshedJwt.getClaims();
		} catch (JwtException ex) {
			throw new RuntimeException("Failed to decode refreshed token: " + ex.getMessage(), ex);
		}
	}
}
