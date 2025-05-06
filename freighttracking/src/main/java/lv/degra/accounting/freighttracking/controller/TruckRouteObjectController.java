package lv.degra.accounting.freighttracking.controller;

import static lv.degra.accounting.core.config.ApiConstants.ENDPOINT_TRUCK_OBJECT;
import static lv.degra.accounting.core.config.ApiConstants.FREIGHT_TRACKING_PATH;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    
    @PostMapping(ENDPOINT_TRUCK_OBJECT)
    public ResponseEntity<?> createTruckObject(@RequestBody TruckObjectDto truckObjectDto) {
        try {

            if (truckObjectService.existsByNameIgnoreCase(truckObjectDto.getName())) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Objekts ar šādu nosaukumu jau eksistē");
                response.put("duplicate", true);
                return ResponseEntity.badRequest().body(response);
            }
            

            List<TruckObjectDto> similarObjects = truckObjectService.findSimilarObjects(truckObjectDto.getName());
            

            if (!similarObjects.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("warning", "Atrasti līdzīgi objekti");
                response.put("similarObjects", similarObjects);
                response.put("originalObject", truckObjectDto);
                return ResponseEntity.ok(response);
            }
            

            TruckObjectDto savedObject = truckObjectService.saveTruckObject(truckObjectDto);
            return ResponseEntity.ok(savedObject);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create truck object: " + e.getMessage());
        }
    }
    
    @PostMapping(ENDPOINT_TRUCK_OBJECT + "/force-create")
    public ResponseEntity<TruckObjectDto> forceCreateTruckObject(@RequestBody TruckObjectDto truckObjectDto) {
        try {

            TruckObjectDto savedObject = truckObjectService.saveTruckObject(truckObjectDto);
            return ResponseEntity.ok(savedObject);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create truck object: " + e.getMessage());
        }
    }
    
    @GetMapping(ENDPOINT_TRUCK_OBJECT + "/check-similar")
    public ResponseEntity<List<TruckObjectDto>> checkSimilarObjects(@RequestParam String name) {
        try {
            List<TruckObjectDto> similarObjects = truckObjectService.findSimilarObjects(name);
            return ResponseEntity.ok(similarObjects);
        } catch (Exception e) {
            throw new RuntimeException("Failed to check similar objects: " + e.getMessage());
        }
    }
}
