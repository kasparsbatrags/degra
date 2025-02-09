package lv.degra.accounting.core.truck.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.model.TruckRepository;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMap;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMapRepository;
import lv.degra.accounting.core.user.model.User;

@Service
public class TruckServiceImpl implements TruckService {

	private final TruckRepository truckRepository;
	private final TruckUserMapRepository truckUserMapRepository;

	public TruckServiceImpl(TruckRepository truckRepository, TruckUserMapRepository truckUserMapRepository) {
		this.truckRepository = truckRepository;
		this.truckUserMapRepository = truckUserMapRepository;
	}

	public Optional<Truck> getDefaultTruckForUser(User user) {
		return truckUserMapRepository.findByUser(user).stream()
				.filter(TruckUserMap::getIsDefault)
				.map(TruckUserMap::getTruck)
				.findFirst();
	}


	public List<Truck> getAllTrucksForUser(User user) {
		return truckUserMapRepository.findByUser(user).stream()
				.map(TruckUserMap::getTruck)
				.collect(Collectors.toList());
	}

	public Truck save(Truck truck) {
		return truckRepository.save(truck);
	}
}
