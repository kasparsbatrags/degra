package lv.degra.accounting.core.truck.service;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.model.TruckRepository;
import lv.degra.accounting.core.user.model.User;

@Service
public class TruckServiceImpl implements TruckService {

	private final TruckRepository truckRepository;

	public TruckServiceImpl(TruckRepository truckRepository) {
		this.truckRepository = truckRepository;
	}

	public Truck getTruckByUser(User user) {
		return truckRepository.findByUser(user);
	}

	public Truck save(Truck truck) {
		return truckRepository.save(truck);
	}
}
