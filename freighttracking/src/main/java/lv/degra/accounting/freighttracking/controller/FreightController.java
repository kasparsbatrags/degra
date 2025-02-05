package lv.degra.accounting.freighttracking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.exception.InvalidRequestException;
import lv.degra.accounting.core.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/freight")
public class FreightController {

    @GetMapping("/user")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<String> getFreightData() {
        try {
            // Simulating some business logic that might fail
            return ResponseEntity.ok("Protected Freight Data");
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve freight data");
        }
    }

    @GetMapping("/shipment/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<String> getShipmentById(@PathVariable Long id) {
        if (id <= 0) {
            throw new InvalidRequestException("Invalid shipment ID: must be greater than 0");
        }
        
        // Simulating a case where shipment is not found
        if (id > 1000) {
            throw new ResourceNotFoundException("Shipment not found with id: " + id);
        }

        try {
            // Simulating business logic that might fail
            return ResponseEntity.ok("Shipment data for ID: " + id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve shipment data");
        }
    }

    @GetMapping("/public")
    public ResponseEntity<String> getFreightPublicData() {
        return ResponseEntity.ok("Public Freight Data");
    }
}
