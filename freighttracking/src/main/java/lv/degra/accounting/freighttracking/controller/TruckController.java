package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.DEFAULT_PATH_NAME;
import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.ws.rs.InternalServerErrorException;
import lv.degra.accounting.core.exception.InvalidRequestException;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.utils.UserContextUtils;

@RestController
@RequestMapping(FREIGHT_TRACKING_PATH)
public class TruckController {

	private final TruckService truckService;

	public TruckController(TruckService truckService) {
		this.truckService = truckService;
	}

	@GetMapping(ENDPOINT_TRUCK)
	public ResponseEntity<List<TruckDto>> getAllTrucks() {

		String userId = UserContextUtils.getCurrentUserId();

		try {

			List<TruckDto> trucks = truckService.getAllTrucksByUserFirstDefault(userId);

			return ResponseEntity.ok(trucks);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			throw new InternalServerErrorException("Failed to retrieve trucks", e);
		}
	}

	@GetMapping(ENDPOINT_TRUCK + DEFAULT_PATH_NAME)
	public ResponseEntity<TruckDto> getDefaultTruckByUser() {


		String userId = UserContextUtils.getCurrentUserId();

		try {

			TruckDto defaultTruckDtoForUser = truckService.getDefaultTruckDtoForUser(userId);

			return ResponseEntity.ok(defaultTruckDtoForUser);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			throw new InternalServerErrorException("Failed to retrieve truck routes", e);
		}
	}
}
