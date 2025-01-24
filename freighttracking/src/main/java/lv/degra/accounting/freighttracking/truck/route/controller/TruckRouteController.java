package lv.degra.accounting.freighttracking.truck.route.controller;

import static lv.degra.accounting.freighttracking.configure.ApiConstants.TRUCK_ROUTES;
import static lv.degra.accounting.freighttracking.configure.ApiConstants.USER_ENDPOINT;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.truck.route.model.TruckRoute;
import lv.degra.accounting.core.truck.route.service.TruckRouteService;

@RestController
@RequestMapping(TRUCK_ROUTES)
@PreAuthorize("hasAuthority('ROLE_USER')")
public class TruckRouteController {

	private final TruckRouteService truckRouteService;

	@Autowired
	public TruckRouteController(TruckRouteService truckRouteService) {
		this.truckRouteService = truckRouteService;
	}

	@GetMapping(USER_ENDPOINT + "/{userId}")
	public ResponseEntity<List<TruckRoute>> getLastTruckRoutes(
			@PathVariable Integer userId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size) {

		List<TruckRoute> truckRoutes = truckRouteService.getLastTruckRoutesByUserId(userId, page, size);
		return ResponseEntity.ok(truckRoutes);
	}
}
