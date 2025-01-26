package lv.degra.accounting.freighttracking.truck.route.controller;

import static lv.degra.accounting.core.config.ApiConstants.BASE_API_URL;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING;
import static lv.degra.accounting.core.config.ApiConstants.TRUCK_ROUTES;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.truck.route.model.TruckRoute;
import lv.degra.accounting.core.truck.route.service.TruckRouteService;
import lv.degra.accounting.freighttracking.config.JwtTokenProvider;

@RestController
@RequestMapping(BASE_API_URL + FREIGHT_TRACKING)
@PreAuthorize("hasAuthority('USER')")
public class TruckRouteController {

	private final TruckRouteService truckRouteService;
	private final JwtTokenProvider jwtTokenProvider;

	@Autowired
	public TruckRouteController(TruckRouteService truckRouteService, JwtTokenProvider jwtTokenProvider) {
		this.truckRouteService = truckRouteService;
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@GetMapping(TRUCK_ROUTES)
	public ResponseEntity<List<TruckRoute>> getLastTruckRoutes(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {

		String token = authHeader.substring(7);
		Map<String, Object> claims = jwtTokenProvider.parseToken(token);

		String userId = (String) claims.get("sub");
		List<TruckRoute> truckRoutes = truckRouteService.getLastTruckRoutesByUserId(userId, page, size);

		return ResponseEntity.ok(truckRoutes);
	}
}
