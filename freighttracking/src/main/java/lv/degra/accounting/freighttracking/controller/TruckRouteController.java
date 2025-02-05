package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTE;
import static lv.degra.accounting.core.config.ApiConstants.PATH_FREIGHT_TRACKING;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.ws.rs.InternalServerErrorException;
import lv.degra.accounting.core.exception.InvalidRequestException;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.truck_route.service.TruckRouteService;
import lv.degra.accounting.usermanager.config.JwtTokenProvider;

@RestController
@RequestMapping(PATH_FREIGHT_TRACKING)
public class TruckRouteController {

	private final TruckRouteService truckRouteService;
	private final JwtTokenProvider jwtTokenProvider;

	@Autowired
	public TruckRouteController(TruckRouteService truckRouteService, JwtTokenProvider jwtTokenProvider) {
		this.truckRouteService = truckRouteService;
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTE)
	public ResponseEntity<List<TruckRoute>> getLastTruckRoutes(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size) {

		// Validate pagination parameters
		if (page < 0) {
			throw new InvalidRequestException("Page number cannot be negative");
		}
		if (size <= 0 || size > 100) {
			throw new InvalidRequestException("Page size must be between 1 and 100");
		}

		try {
			// Get user ID from JWT
			Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			String userId = jwt.getSubject();

			if (userId == null || userId.trim().isEmpty()) {
				throw new InvalidRequestException("Invalid user ID in token");
			}

			// Get truck routes
			List<TruckRoute> truckRoutes = truckRouteService.getLastTruckRoutesByUserId(userId, page, size);

			if (truckRoutes.isEmpty() && page > 0) {
				throw new ResourceNotFoundException("No truck routes found for page " + page);
			}

			return ResponseEntity.ok(truckRoutes);

		} catch (Exception e) {
			if (e instanceof InvalidRequestException || e instanceof ResourceNotFoundException) {
				throw e;
			}
			throw new InternalServerErrorException("Failed to retrieve truck routes", e);
		}
	}

}
