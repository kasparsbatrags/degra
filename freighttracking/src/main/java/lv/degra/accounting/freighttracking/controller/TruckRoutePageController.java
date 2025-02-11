package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_EXIST;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTE_PAGES;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.service.TruckRoutePageService;
import lv.degra.accounting.core.user.model.User;
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

	@GetMapping(ENDPOINT_TRUCK_ROUTE_PAGES + ENDPOINT_EXIST)
	public ResponseEntity<Boolean> checkTruckRoutePageExists(@RequestParam Integer truckId, @RequestParam LocalDate routeDate) {

		String userId = UserContextUtils.getCurrentUserId();

		User user = userRepository.findByUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

		List<TruckDto>  allUserTrucks = truckService.getAllTrucksByUserFirstDefault(userId);

		if (!allUserTrucks.stream()
				.anyMatch(truckDto -> truckDto.getId().equals(truckId))) {
			throw new ResourceNotFoundException("Truck with ID: " + truckId+ " is not allowed for user with ID "+ userId );
		}

		Truck truck = truckService.getById(truckId)
				.orElseThrow(() -> new ResourceNotFoundException("Truck not found with ID: " + truckId));

		return ResponseEntity.ok(truckRoutePageService.userRoutePageByRouteDate(routeDate, user, truck));
	}
}
