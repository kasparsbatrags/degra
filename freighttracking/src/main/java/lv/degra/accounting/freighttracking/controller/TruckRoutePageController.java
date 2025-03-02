package lv.degra.accounting.freighttracking.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_EXIST;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTE_PAGES;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.service.TruckRoutePageService;
import lv.degra.accounting.core.user.model.UserRepository;
import lv.degra.accounting.core.utils.UserContextUtils;
import lv.degra.accounting.core.validation.request.RequestValidator;

@RestController
@RequestMapping(FREIGHT_TRACKING_PATH)
public class TruckRoutePageController {

	private final TruckRoutePageService truckRoutePageService;
	private final UserRepository userRepository;
	private final TruckService truckService;

	public TruckRoutePageController(TruckRoutePageService truckRoutePageService, UserRepository userRepository, TruckService truckService) {
		this.truckRoutePageService = truckRoutePageService;
		this.userRepository = userRepository;
		this.truckService = truckService;
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTE_PAGES)
	public ResponseEntity<List<TruckRoutePageDto>> getRoutePages(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size) {

		RequestValidator.validatePageRequest(page, size);

		try {

			String userId = UserContextUtils.getCurrentUserId();

			List<TruckRoutePageDto> truckRoutePages = truckRoutePageService.getUserRoutePagesDto(userId, page, size);

			if (truckRoutePages == null || truckRoutePages.isEmpty()) {
				throw new ResourceNotFoundException("No truck route pages found");
			}

			return ResponseEntity.ok(truckRoutePages);

		} catch (Exception e) {
			if (e instanceof ResourceNotFoundException) {
				throw e;
			}
			throw new RuntimeException("Failed to retrieve truck route pages: " + e.getMessage());
		}
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTE_PAGES + "/{id}")
	public ResponseEntity<TruckRoutePageDto> getRoutePageById(@PathVariable Integer id) {
		TruckRoutePageDto truckRoutePageDto = truckRoutePageService.findById(id);
		return ResponseEntity.ok(truckRoutePageDto);
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTE_PAGES + ENDPOINT_EXIST)
	public ResponseEntity<TruckRoutePageDto> checkTruckRoutePageExists(@RequestParam Integer truckId, @RequestParam LocalDate routeDate) {
		String userId = UserContextUtils.getCurrentUserId();
		return ResponseEntity.ok(truckRoutePageService.userRoutePageByRouteDateExists(routeDate, userId, truckId));
	}

	@PutMapping(ENDPOINT_TRUCK_ROUTE_PAGES + "/{id}")
	public ResponseEntity<TruckRoutePageDto> updateTruckRoutePage(@PathVariable Integer id,
			@Valid @RequestBody TruckRoutePageDto truckRoutePageDto) {

		TruckRoutePageDto updatedPage = truckRoutePageService.updateTruckRoutePage(id, truckRoutePageDto);
		return ResponseEntity.ok(updatedPage);
	}
}
