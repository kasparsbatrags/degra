package lv.degra.accounting.freighttracking.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.InternalServerErrorException;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_LAST_ACTIVE;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTES;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTE_BY_PAGE;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;
import lv.degra.accounting.core.exception.InvalidRequestException;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route.service.TruckRouteService;
import lv.degra.accounting.core.utils.UserContextUtils;
import lv.degra.accounting.core.validation.request.RequestValidator;

@RestController
@RequestMapping(FREIGHT_TRACKING_PATH)
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
		String userId = UserContextUtils.getCurrentUserId();

		try {
			Page<TruckRouteDto> truckRoutesPages = truckRouteService.getLastTruckRoutesByUserId(userId, pageNumber, pageSize);

			if (truckRoutesPages.isEmpty()) {
				throw new ResourceNotFoundException("No truck routes found for page " + pageNumber);
			}

			return ResponseEntity.ok(truckRoutesPages);
		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			throw new InternalServerErrorException("Failed to retrieve truck routes", e);
		}
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTES + ENDPOINT_LAST_ACTIVE)
	public ResponseEntity<TruckRouteDto> getLastTruckRoute() {

		String userId = UserContextUtils.getCurrentUserId();

		try {
			Optional<TruckRouteDto> truckRoute = truckRouteService.getLastTruckRouteByUserId(userId);

			if (!truckRoute.isPresent()) {
				throw new ResourceNotFoundException("No opened truck route found");
			}

			return ResponseEntity.ok(truckRoute.get());
		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			throw new InternalServerErrorException("Failed to retrieve truck routes", e);
		}
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTES + ENDPOINT_TRUCK_ROUTE_BY_PAGE + "/{truckRoutePageId}")
	public ResponseEntity<Page<TruckRouteDto>> getTruckRoutesByTruckRoutePage(
			@org.springframework.web.bind.annotation.PathVariable Integer truckRoutePageId,
			@RequestParam(defaultValue = "0") int pageNumber,
			@RequestParam(defaultValue = "5") int pageSize) {

		RequestValidator.validatePageRequest(pageNumber, pageSize);

		try {
			Page<TruckRouteDto> truckRoutesPages = truckRouteService.getTruckRoutesByTruckRoutePageId(truckRoutePageId, pageNumber, pageSize);

			if (truckRoutesPages.isEmpty()) {
				throw new ResourceNotFoundException("No truck routes found for truck route page ID " + truckRoutePageId);
			}

			return ResponseEntity.ok(truckRoutesPages);
		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			throw new InternalServerErrorException("Failed to retrieve truck routes", e);
		}
	}


	@PostMapping(ENDPOINT_TRUCK_ROUTES)
	public ResponseEntity<TruckRouteDto> createNewTruckRoutes(@Valid @RequestBody TruckRouteDto truckRouteDto) {

		try {
			return ResponseEntity.ok(truckRouteService.createOrUpdateTruckRoute(truckRouteDto));
		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			throw new InternalServerErrorException("Failed to create truck route", e);
		}
	}

	@PutMapping(ENDPOINT_TRUCK_ROUTES)
	public ResponseEntity<TruckRouteDto> updateTruckRoute(@Valid @RequestBody TruckRouteDto truckRouteDto) {

		if (truckRouteDto.getId() == null) {
			throw new BadRequestException("TruckRoute ID must be provided in the request body.");
		}

		try {
			TruckRouteDto updatedRoute = truckRouteService.createOrUpdateTruckRoute(truckRouteDto);
			return ResponseEntity.ok(updatedRoute);
		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			throw new InternalServerErrorException("Failed to update truck route", e);
		}
	}

}
