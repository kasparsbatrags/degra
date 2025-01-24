package lv.degra.accounting.freighttracking.configure.security;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lv.degra.accounting.freighttracking.configure.JwtTokenProvider;


public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenProvider jwtTokenProvider;

	public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws IOException, ServletException {

		String authorizationHeader = request.getHeader("Authorization");
		String refreshToken = request.getHeader("Refresh");

		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			String token = authorizationHeader.substring(7);
			Map<String, Object> claims = jwtTokenProvider.extractUserClaims(token, refreshToken);

			String username = (String) claims.get("preferred_username");
			List<String> roles = ((Map<String, Map<String, List<String>>>) claims.get("resource_access"))
					.get("freight-tracking-client")
					.get("roles");

			SecurityContextHolder.getContext().setAuthentication(
					new UsernamePasswordAuthenticationToken(username, null, roles.stream()
							.map(SimpleGrantedAuthority::new)
							.collect(Collectors.toList()))
			);
		}

		filterChain.doFilter(request, response);
	}

}
