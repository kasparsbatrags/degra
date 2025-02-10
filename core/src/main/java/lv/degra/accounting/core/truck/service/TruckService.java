package lv.degra.accounting.core.truck.service;

import java.util.List;
import java.util.Optional;

import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.user.model.User;

public interface TruckService {
	Optional<Truck> getDefaultTruckForUser(User user);

	TruckDto getDefaultTruckDtoForUser(String userId);

	List<TruckDto> getAllTrucksByUserFirstDefault(String userId);

	Truck save(Truck truck);

}
