package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_CARGO_TYPES;
import static lv.degra.accounting.core.config.ApiConstants.PATH_FREIGHT_TRACKING;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.cargo_type.dto.CargoTypeDto;
import lv.degra.accounting.core.cargo_type.service.CargoTypeService;
import lv.degra.accounting.core.exception.ResourceNotFoundException;

@RestController
@RequestMapping(PATH_FREIGHT_TRACKING)
public class CargoTypeController {

	private final CargoTypeService cargoTypeService;

	public CargoTypeController(CargoTypeService cargoTypeService) {
		this.cargoTypeService = cargoTypeService;
	}

	@GetMapping(ENDPOINT_CARGO_TYPES)
	public ResponseEntity<List<CargoTypeDto>> getCargoTypes() {
		try {
			List<CargoTypeDto> cargoTypeDtos = cargoTypeService.getCargoTypesDto();

			if (cargoTypeDtos == null || cargoTypeDtos.isEmpty()) {
				throw new ResourceNotFoundException("No cargo types found");
			}

			return ResponseEntity.ok(cargoTypeDtos);

		} catch (Exception e) {
			if (e instanceof ResourceNotFoundException) {
				throw e;
			}
			throw new RuntimeException("Failed to retrieve cargo types: " + e.getMessage());
		}

	}
}
