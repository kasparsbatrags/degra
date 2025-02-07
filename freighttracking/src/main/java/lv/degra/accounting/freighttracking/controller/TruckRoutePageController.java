package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_PAGES;
import static lv.degra.accounting.core.config.ApiConstants.PATH_FREIGHT_TRACKING;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.service.TruckRoutePageService;
import lv.degra.accounting.core.utils.UserContextUtils;
import lv.degra.accounting.core.validation.request.RequestValidator;

@RestController
@RequestMapping(PATH_FREIGHT_TRACKING)
public class TruckRoutePageController {

	private final TruckRoutePageService truckRoutePageService;

	public TruckRoutePageController(TruckRoutePageService truckRoutePageService) {
		this.truckRoutePageService = truckRoutePageService;
	}

	@GetMapping(ENDPOINT_TRUCK_PAGES)
	public ResponseEntity<List<TruckRoutePageDto>> getTruckObjects(@RequestParam(defaultValue = "0") int page,
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
}
