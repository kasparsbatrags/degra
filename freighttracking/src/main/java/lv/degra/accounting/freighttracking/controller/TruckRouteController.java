package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_ROUTES;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;

import java.util.Optional;

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
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.model.TruckRepository;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route.service.TruckRouteService;
import lv.degra.accounting.core.truck_route_page.service.TruckRoutePageService;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.model.UserRepository;
import lv.degra.accounting.core.utils.UserContextUtils;
import lv.degra.accounting.core.validation.request.RequestValidator;

@RestController
@RequestMapping(FREIGHT_TRACKING_PATH)
public class TruckRouteController {

	private final TruckRouteService truckRouteService;
	private final TruckRoutePageService truckRoutePageService;
	private final UserRepository userRepository;
	private final TruckRepository truckRepository;

	@Autowired
	public TruckRouteController(TruckRouteService truckRouteService, TruckRoutePageService truckRoutePageService,
			UserRepository userRepository, TruckRepository truckRepository) {
		this.truckRouteService = truckRouteService;
		this.truckRoutePageService = truckRoutePageService;
		this.userRepository = userRepository;
		this.truckRepository = truckRepository;
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

	@PostMapping(ENDPOINT_TRUCK_ROUTES)
	public ResponseEntity<TruckRouteDto> createNewTruckRoutes(@Valid @RequestBody TruckRouteDto truckRouteDto) {
		String userId = UserContextUtils.getCurrentUserId();

		User user = userRepository.findByUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

		Long truckId = Long.valueOf(truckRouteDto.getTruckRoutePage().getId());
		Truck truck = truckRepository.findById(truckId)
				.orElseThrow(() -> new ResourceNotFoundException("Truck not found with ID: " + truckId));

		truckRouteDto.setTruckRoutePage(Optional.ofNullable(truckRouteDto.getTruckRoutePage())
				.orElseGet(() -> truckRoutePageService.getOrCreateUserRoutePageByRouteDate(truckRouteDto, user, truck)));

		try {
			return ResponseEntity.ok(truckRouteService.createOrUpdateTrucRoute(truckRouteDto));
		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			throw new InternalServerErrorException("Failed to create truck route", e);
		}
	}
}
