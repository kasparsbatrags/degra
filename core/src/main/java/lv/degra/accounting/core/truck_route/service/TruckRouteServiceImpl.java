package lv.degra.accounting.core.truck_route.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.config.mapper.FreightMapper;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route.model.TruckRouteRepository;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;

@Service
public class TruckRouteServiceImpl implements TruckRouteService {

	private final TruckRouteRepository truckRouteRepository;
	private final UserService userService;
	private final FreightMapper freightMapper;

	public TruckRouteServiceImpl(TruckRouteRepository truckRouteRepository, UserService userService,
			FreightMapper freightMapper) {
		this.truckRouteRepository = truckRouteRepository;
		this.userService = userService;
		this.freightMapper = freightMapper;
	}

	public Page<TruckRouteDto> getLastTruckRoutesByUserId(String userId, int page, int size) {
		User user = userService.getByUserId(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

		Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

		return truckRouteRepository.findByUserId(user.getId(), pageable)
				.map(freightMapper::toDto);
	}


	public TruckRouteDto createOrUpdateTrucRoute(TruckRouteDto truckRouteDto) {
		return freightMapper.toDto(truckRouteRepository.save(freightMapper.toEntity(truckRouteDto)));
	}
}
