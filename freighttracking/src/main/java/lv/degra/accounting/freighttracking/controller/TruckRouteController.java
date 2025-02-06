package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTE;
import static lv.degra.accounting.core.config.ApiConstants.PATH_FREIGHT_TRACKING;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.ws.rs.InternalServerErrorException;
import lv.degra.accounting.core.exception.InvalidRequestException;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.truck_route.service.TruckRouteService;
import lv.degra.accounting.core.utils.UserContextUtils;
import lv.degra.accounting.core.validation.request.RequestValidator;

@RestController
@RequestMapping(PATH_FREIGHT_TRACKING)
public class TruckRouteController {

	private final TruckRouteService truckRouteService;

	@Autowired
	public TruckRouteController(TruckRouteService truckRouteService) {
		this.truckRouteService = truckRouteService;
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTE)
	public ResponseEntity<List<TruckRoute>> getLastTruckRoutes(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size) {

		RequestValidator.validatePageRequest(page, size);

		try {
			String userId = UserContextUtils.getCurrentUserId();
			
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
