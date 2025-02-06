package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTES;
import static lv.degra.accounting.core.config.ApiConstants.PATH_FREIGHT_TRACKING;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.ws.rs.InternalServerErrorException;
import lv.degra.accounting.core.exception.InvalidRequestException;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
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

	@GetMapping(ENDPOINT_TRUCK_ROUTES)
	public ResponseEntity<Page<TruckRouteDto>> getLastTruckRoutes(@RequestParam(defaultValue = "0") int pageNumber,
			@RequestParam(defaultValue = "5") int pageSize) {

		RequestValidator.validatePageRequest(pageNumber, pageSize);

		try {

			String userId = UserContextUtils.getCurrentUserId();

			Page<TruckRouteDto> truckRoutesPages = truckRouteService.getLastTruckRoutesByUserId(userId, pageNumber, pageSize);

			if (truckRoutesPages.getContent().isEmpty()) {
				throw new ResourceNotFoundException("No truck routes found for page " + pageNumber);
			}

			return ResponseEntity.ok(truckRoutesPages);

		} catch (Exception e) {
			if (e instanceof InvalidRequestException || e instanceof ResourceNotFoundException) {
				throw e;
			}
			throw new InternalServerErrorException("Failed to retrieve truck routes", e);
		}
	}

	@PostMapping(ENDPOINT_TRUCK_ROUTES)
	public ResponseEntity<TruckRouteDto> createNewTruckRoutes(@Valid @RequestBody TruckRouteDto truckRouteDto) {
		try {
			String userId = UserContextUtils.getCurrentUserId();

			TruckRouteDto truckRoute = truckRouteService.createOrUpdateTrucRoute(truckRouteDto);

			return ResponseEntity.ok(truckRoute);

		} catch (Exception e) {
			if (e instanceof InvalidRequestException || e instanceof ResourceNotFoundException) {
				throw e;
			}
			throw new InternalServerErrorException("Failed to create truck route", e);
		}
	}

}
