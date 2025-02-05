package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUC_OBJECT;
import static lv.degra.accounting.core.config.ApiConstants.PATH_FREIGHT_TRACKING;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.truck_object.dto.TruckObjectDto;
import lv.degra.accounting.core.truck_object.service.TruckObjectService;

@RestController
@RequestMapping(PATH_FREIGHT_TRACKING)
public class TruckRouteObjectController {

	private final TruckObjectService truckObjectService;

	public TruckRouteObjectController(TruckObjectService truckObjectService) {
		this.truckObjectService = truckObjectService;
	}

	@GetMapping(ENDPOINT_TRUC_OBJECT)
	public ResponseEntity<List<TruckObjectDto>> getTruckObjects() {
		return ResponseEntity.ok(truckObjectService.getTruckObjectList());
	}

}
