package lv.degra.accounting.core.truck.service;

import jakarta.validation.constraints.NotNull;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.user.model.User;

public interface TruckService {
	@NotNull Truck getTruckByUser(User user);

	Truck save(Truck truck);
}
