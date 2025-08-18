package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_EXIST;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTE_PAGES;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lv.degra.accounting.core.PagedResponse;
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

	public TruckRoutePageController(TruckRoutePageService truckRoutePageService, UserRepository userRepository, TruckService truckService) {
		this.truckRoutePageService = truckRoutePageService;
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTE_PAGES)
	public ResponseEntity<PagedResponse<TruckRoutePageDto>> getRoutePages(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size) {

		RequestValidator.validatePageRequest(page, size);

		String userId = UserContextUtils.getCurrentUserId();

		List<TruckRoutePageDto> truckRoutePages = truckRoutePageService.getUserRoutePagesDto(userId, page, size);
		long totalCount = truckRoutePageService.countUserRoutePages(userId);

		if (truckRoutePages == null) {
			truckRoutePages = Collections.emptyList();
		}

		PagedResponse<TruckRoutePageDto> response = new PagedResponse<>(truckRoutePages, page, size, totalCount);

		return ResponseEntity.ok(response);
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTE_PAGES + "/{id}")
	public ResponseEntity<TruckRoutePageDto> getRoutePageById(@PathVariable String id) {
		TruckRoutePageDto truckRoutePageDto = truckRoutePageService.findById(id);
		return ResponseEntity.ok(truckRoutePageDto);
	}

	@GetMapping(ENDPOINT_TRUCK_ROUTE_PAGES + ENDPOINT_EXIST)
	public ResponseEntity<TruckRoutePageDto> checkTruckRoutePageExists(@RequestParam String truckId, @RequestParam LocalDate routeDate) {
		String userId = UserContextUtils.getCurrentUserId();
		return ResponseEntity.ok(truckRoutePageService.userRoutePageByRouteDateExists(routeDate, userId, truckId));
	}

	@PutMapping(ENDPOINT_TRUCK_ROUTE_PAGES + "/{id}")
	public ResponseEntity<TruckRoutePageDto> updateTruckRoutePage(@PathVariable String id,
			@Valid @RequestBody TruckRoutePageDto truckRoutePageDto) {

		TruckRoutePageDto updatedPage = truckRoutePageService.updateTruckRoutePage(id, truckRoutePageDto);
		return ResponseEntity.ok(updatedPage);
	}

	@DeleteMapping(ENDPOINT_TRUCK_ROUTE_PAGES + "/{id}")
	public ResponseEntity<TruckRoutePageDto> deleteTruckRoutePage(@PathVariable String id) {
		String userId = UserContextUtils.getCurrentUserId();
		truckRoutePageService.deleteTruckRoutePage(id, userId);
		return ResponseEntity.noContent().build();
	}
}
