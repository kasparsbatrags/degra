package lv.degra.accounting.core.truck.service;

import java.util.List;
import java.util.Optional;

import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.user.model.User;

public interface TruckService {
	Optional<Truck> getDefaultTruckForUser(User user);

	Truck save(Truck truck);

	List<Truck> getAllTrucksForUser(User user);
}
