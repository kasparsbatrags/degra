package lv.degra.accounting.freighttracking.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.user.model.User;

@RestController
@RequestMapping("/api/trucks")
public class TruckController {

	private final TruckService truckService;

	public TruckController(TruckService truckService) {
		this.truckService = truckService;
	}

	@GetMapping("/{userId}/default")
	public ResponseEntity<Truck> getDefaultTruck(@PathVariable String userId) {
		User user = new User();
		user.setId(Integer.parseInt(userId));

		return truckService.getDefaultTruckForUser(user)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@GetMapping("/{userId}/all")
	public ResponseEntity<List<Truck>> getAllTrucks(@PathVariable String userId) {
		User user = new User();
		user.setId(Integer.parseInt(userId));

		List<Truck> trucks = truckService.getAllTrucksForUser(user);
		return ResponseEntity.ok(trucks);
	}
}
