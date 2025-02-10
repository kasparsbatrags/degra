package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_OBJECT;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck_object.dto.TruckObjectDto;
import lv.degra.accounting.core.truck_object.service.TruckObjectService;
@RestController
@RequestMapping(FREIGHT_TRACKING_PATH)
public class TruckRouteObjectController {

    private final TruckObjectService truckObjectService;

    public TruckRouteObjectController(TruckObjectService truckObjectService) {
        this.truckObjectService = truckObjectService;
    }

    @GetMapping(ENDPOINT_TRUCK_OBJECT)
    public ResponseEntity<List<TruckObjectDto>> getTruckObjects() {
        try {
            List<TruckObjectDto> truckObjects = truckObjectService.getTruckObjectListDto();
            
            if (truckObjects == null || truckObjects.isEmpty()) {
                throw new ResourceNotFoundException("No truck objects found");
            }
            
            return ResponseEntity.ok(truckObjects);
            
        } catch (Exception e) {
            if (e instanceof ResourceNotFoundException) {
                throw e;
            }
            throw new RuntimeException("Failed to retrieve truck objects: " + e.getMessage());
        }
    }
}
