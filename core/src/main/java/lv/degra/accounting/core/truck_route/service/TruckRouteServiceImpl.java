package lv.degra.accounting.core.truck_route.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.config.mapper.FreightMapper;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.truck_route.model.TruckRouteRepository;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.service.TruckRoutePageService;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMapRepository;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;
import lv.degra.accounting.core.utils.TruckAccessUtils;
import lv.degra.accounting.core.utils.UserContextUtils;

@Service
public class TruckRouteServiceImpl implements TruckRouteService {

	private static final int LAST_TEN_RECORDS = 10;
	private static final int FIRST_PAGE = 0;
	private static final Double DEFAULT_CONSUMPTION_NORM = 1.0;
	private final TruckRouteRepository truckRouteRepository;
	private final TruckRoutePageService truckRoutePageService;
	private final UserService userService;
	private final TruckService truckService;
	private final FreightMapper freightMapper;
	private final TruckUserMapRepository truckUserMapRepository;

	public TruckRouteServiceImpl(TruckRouteRepository truckRouteRepository, TruckRoutePageService truckRoutePageService,
			UserService userService, TruckService truckService, FreightMapper freightMapper,
			TruckUserMapRepository truckUserMapRepository) {
		this.truckRouteRepository = truckRouteRepository;
		this.truckRoutePageService = truckRoutePageService;
		this.userService = userService;
		this.truckService = truckService;
		this.freightMapper = freightMapper;
		this.truckUserMapRepository = truckUserMapRepository;
	}

	public Page<TruckRouteDto> getLastTruckRoutesByUserId(String userId, int page, int size) {
		User user = userService.getUserByUserId(userId);

		Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

		return truckRouteRepository.findByUserId(user.getId(), pageable).map(freightMapper::toDto);
	}

	protected void validateUserAccessToTruck(Integer truckId, User user) {
		TruckAccessUtils.validateUserAccessToTruck(truckId, user, truckUserMapRepository);
	}

	public TruckRouteDto createOrUpdateTruckRoute(TruckRouteDto truckRouteDto) {
		String userId = UserContextUtils.getCurrentUserId();
		User user = userService.getUserByUserId(userId);

		Integer truckId = truckRouteDto.getTruckRoutePage().getTruck().getId();

		validateUserAccessToTruck(truckId, user);

		TruckDto truckDto = truckService.findTruckDtoById(truckId);

		truckRouteDto.setTruckRoutePage(truckRoutePageService.getOrCreateUserRoutePageByRouteDate(truckRouteDto, user, truckDto));

		truckRouteDto.setRouteLength(calculateRouteLength(truckRouteDto));
		truckRouteDto.setFuelConsumed(calculateFuelConsume(truckRouteDto));

		double fuelBalanceAtFinish = calculateFuelBalanceAtFinish(truckRouteDto);
		truckRouteDto.setFuelBalanceAtFinish(fuelBalanceAtFinish);

		TruckRoutePageDto truckRoutePage = truckRouteDto.getTruckRoutePage();
		truckRoutePage.setFuelBalanceAtFinish(fuelBalanceAtFinish);
		truckRoutePageService.save(truckRoutePage);

		TruckRoute truckRoute = freightMapper.toEntity(truckRouteDto);
		return freightMapper.toDto(truckRouteRepository.save(truckRoute));
	}

	protected int calculateRouteLength(TruckRouteDto truckRouteDto) {
		long start = Objects.requireNonNullElse(truckRouteDto.getOdometerAtStart(), 0L);
		long finish = Objects.requireNonNullElse(truckRouteDto.getOdometerAtFinish(), 0L);

		return (finish > start) ? Math.toIntExact(finish - start) : 0;
	}

	protected double calculateFuelBalanceAtFinish(TruckRouteDto truckRouteDto) {
		return BigDecimal.valueOf(
				Objects.requireNonNullElse(truckRouteDto.getFuelBalanceAtStart(), Double.valueOf(0)) - Objects.requireNonNullElse(
						truckRouteDto.getFuelConsumed(), Double.valueOf(0)) + Objects.requireNonNullElse(truckRouteDto.getFuelReceived(),
						Double.valueOf(0))).setScale(2, RoundingMode.HALF_UP).doubleValue();
	}

	protected double calculateFuelConsume(TruckRouteDto truckRouteDto) {
		int routeLength = Objects.requireNonNullElse(truckRouteDto.getRouteLength(), 0);

		if (routeLength <= 0) {
			return 0.0;
		}

		double fuelConsumptionNorm = Optional.ofNullable(truckRouteDto.getTruckRoutePage()).map(TruckRoutePageDto::getTruck)
				.map(TruckDto::getFuelConsumptionNorm).filter(norm -> norm > 0).orElse(DEFAULT_CONSUMPTION_NORM);

		double result = (fuelConsumptionNorm / 100) * routeLength;

		return BigDecimal.valueOf(result).setScale(2, RoundingMode.HALF_UP).doubleValue();
	}

	public Optional<TruckRouteDto> getLastTruckRouteByUserId(String userId) {
		Page<TruckRouteDto> truckRouteDtoPage = getLastTruckRoutesByUserId(userId, FIRST_PAGE, LAST_TEN_RECORDS);

		List<TruckRouteDto> routes = truckRouteDtoPage.getContent();
		if (routes.isEmpty()) {
			return Optional.empty();
		}

		TruckRoutePageDto firstRoutePage = routes.getFirst().getTruckRoutePage();

		return routes.stream().filter(route -> Objects.equals(route.getTruckRoutePage(), firstRoutePage) && route.getInDateTime() == null)
				.findFirst();
	}

	public TruckRouteDto findById(Integer id) {
		return truckRouteRepository.findById(id).map(freightMapper::toDto)
				.orElseThrow(() -> new ResourceNotFoundException("Truck route not found with ID: " + id));
	}

}
