package lv.degra.accounting.core.truck.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lv.degra.accounting.core.config.mapper.FreightMapper;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.model.TruckRepository;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMap;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMapRepository;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;

@Service
public class TruckServiceImpl implements TruckService {

	private final TruckRepository truckRepository;
	private final TruckUserMapRepository truckUserMapRepository;
	private final FreightMapper freightMapper;
	private final UserService userService;

	public TruckServiceImpl(TruckRepository truckRepository, TruckUserMapRepository truckUserMapRepository,
			FreightMapper freightMapper, UserService userService) {
		this.truckRepository = truckRepository;
		this.truckUserMapRepository = truckUserMapRepository;
		this.freightMapper = freightMapper;
		this.userService = userService;
	}

	public Optional<Truck> getDefaultTruckForUser(User user) {
		return truckUserMapRepository.findByUser(user).stream()
				.filter(TruckUserMap::getIsDefault)
				.map(TruckUserMap::getTruck)
				.findFirst();
	}

	public TruckDto getDefaultTruckDtoForUser(String userId) {
		User user = userService.getUserByUserId(userId);
		return truckUserMapRepository.findByUser(user).stream()
				.filter(TruckUserMap::getIsDefault)
				.map(this::convertToDtoWithDefault)
				.findFirst()
				.orElse(null);
	}

	public List<TruckDto> getAllTrucksByUserFirstDefault(String userId) {
		User user = userService.getUserByUserId(userId);

		List<TruckUserMap> mappings = truckUserMapRepository.findByUser(user);

		List<TruckDto> defaultTruck = mappings.stream()
				.filter(TruckUserMap::getIsDefault)
				.map(this::convertToDtoWithDefault)
				.collect(Collectors.toCollection(ArrayList::new));

		List<TruckDto> otherTrucks = mappings.stream()
				.filter(t -> !t.getIsDefault())
				.map(this::convertToDtoWithDefault)
				.toList();

		defaultTruck.addAll(otherTrucks);

		return defaultTruck;
	}

	public Truck findTruckById(Integer truckId) {
		return truckRepository.findById(truckId)
				.orElseThrow(() -> new ResourceNotFoundException("Truck not found with ID: " + truckId));
	}

	public TruckDto findTruckDtoById(Integer truckId) {
		Truck truck = findTruckById(truckId);
		return freightMapper.toDto(truck);
	}

	public Truck save(Truck truck) {
		return truckRepository.save(truck);
	}

	private TruckDto convertToDtoWithDefault(TruckUserMap truckUserMap) {
		TruckDto truckDto = freightMapper.toDto(truckUserMap.getTruck());
		truckDto.setIsDefault(truckUserMap.getIsDefault());
		return truckDto;
	}
}
