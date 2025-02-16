package lv.degra.accounting.core.truck_route.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.config.mapper.FreightMapper;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.truck_route.model.TruckRouteRepository;
import lv.degra.accounting.core.truck_route_page.service.TruckRoutePageService;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;

@Service
public class TruckRouteServiceImpl implements TruckRouteService {

	private static final int LAST_TEN_RECORDS = 10;
	private static final int FIRST_PAGE = 0;
	private final TruckRouteRepository truckRouteRepository;
	private final UserService userService;
	private final FreightMapper freightMapper;
	private final TruckRoutePageService truckRoutePageService;

	public TruckRouteServiceImpl(TruckRouteRepository truckRouteRepository, UserService userService,
			FreightMapper freightMapper, TruckRoutePageService truckRoutePageService) {
		this.truckRouteRepository = truckRouteRepository;
		this.userService = userService;
		this.freightMapper = freightMapper;
		this.truckRoutePageService = truckRoutePageService;
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

	public Optional<TruckRouteDto> getLastTruckRouteByUserId(String userId) {

		Page<TruckRouteDto> truckRouteDtoPage = getLastTruckRoutesByUserId(userId, FIRST_PAGE, LAST_TEN_RECORDS);

		Optional<TruckRouteDto> result = truckRouteDtoPage.getContent()
				.stream()
				.filter(
						route ->route.getTruckRoutePage().equals(truckRouteDtoPage.getContent().getFirst().getTruckRoutePage())
						&& route.getInTruckObject() == null
				)
				.findFirst();

		return result;
	}

	public Optional<TruckRoute> findById(Integer id) {
		return truckRouteRepository.findById(id);
	}

}
