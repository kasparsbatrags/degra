package lv.degra.accounting.core.truck_route_page.service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lv.degra.accounting.core.config.mapper.FreightMapper;
import lv.degra.accounting.core.exception.ResourceNotFoundException;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePageRepository;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMapRepository;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;
import lv.degra.accounting.core.utils.TruckAccessUtils;

@Service
public class TruckRoutePageServiceImpl implements TruckRoutePageService {

	private final TruckRoutePageRepository truckRoutePageRepository;
	private final UserService userService;
	private final TruckService truckService;
	private final FreightMapper freightMapper;
	private final TruckUserMapRepository truckUserMapRepository;

	public TruckRoutePageServiceImpl(TruckRoutePageRepository truckRoutePageRepository, UserService userService, TruckService truckService,
			FreightMapper freightMapper, TruckUserMapRepository truckUserMapRepository) {
		this.truckRoutePageRepository = truckRoutePageRepository;
		this.userService = userService;
		this.truckService = truckService;
		this.freightMapper = freightMapper;
		this.truckUserMapRepository = truckUserMapRepository;
	}

	protected void validateUserAccessToTruck(String truckId, User user) {
		TruckAccessUtils.validateUserAccessToTruck(truckId, user, truckUserMapRepository);
	}

	public List<TruckRoutePage> getUserRoutePages(String userId, int page, int size) {

		User user = userService.getUserByUserId(userId);

		List<TruckRoutePage> routePages = truckRoutePageRepository.findByUser(user,
				PageRequest.of(page, size, Sort.by(Sort.Order.desc("uid")))).getContent();

		routePages.forEach(TruckRoutePage::calculateSummary);
		return routePages;
	}

	public List<TruckRoutePageDto> getUserRoutePagesDto(String userId, int page, int size) {
		return getUserRoutePages(userId, page, size).stream().map(freightMapper::toDto).toList();
	}

	public TruckRoutePageDto getOrCreateUserRoutePageByRouteDate(TruckRouteDto truckRouteDto, User user, TruckDto truckDto) {
		String truckId = truckDto.getUid();

		validateUserAccessToTruck(truckId, user);

		return truckRoutePageRepository.findByUserAndTruckAndRouteDate(user, freightMapper.toEntity(truckDto), truckRouteDto.getRouteDate())
				.map(this::convertAndCalculateSummary).orElseGet(() -> createNewTruckRoutePage(truckRouteDto, user));
	}

	public TruckRoutePageDto userRoutePageByRouteDateExists(LocalDate routeDate, String userId, String truckId) {
		User user = userService.getUserByUserId(userId);

		List<TruckDto> allUserTrucks = truckService.getAllTrucksByUserFirstDefault(userId);
		if (allUserTrucks.stream().noneMatch(truckDto -> truckDto.getUid().equals(truckId))) {
			throw new ResourceNotFoundException("Truck with ID: " + truckId + " is not allowed for user with ID " + userId);
		}

		Truck truck = truckService.findTruckById(truckId);

		return truckRoutePageRepository.findByUserAndTruckAndRouteDate(user, truck, routeDate).map(this::convertAndCalculateSummary)
				.orElseThrow(() -> new ResourceNotFoundException("Truck route page not found for user and truck on date " + routeDate));
	}

	private TruckRoutePageDto convertAndCalculateSummary(TruckRoutePage truckRoutePage) {
		truckRoutePage.calculateSummary();
		return freightMapper.toDto(truckRoutePage);
	}

	private TruckRoutePageDto createNewTruckRoutePage(TruckRouteDto truckRouteDto, User user) {
		LocalDate routeDate = truckRouteDto.getRouteDate();

		TruckRoutePage truckRoutePageDto = Optional.ofNullable(truckRouteDto.getTruckRoutePage())
				.map(page -> TruckRoutePage.builder()
						.dateFrom(Optional.ofNullable(page.getDateFrom()).orElse(routeDate.withDayOfMonth(1)))
						.dateTo(Optional.ofNullable(page.getDateTo()).orElse(routeDate.with(TemporalAdjusters.lastDayOfMonth())))
						.fuelBalanceAtStart(truckRouteDto.getFuelBalanceAtStart())
						.user(user)
						.build())
				.orElseThrow(() -> new IllegalArgumentException("TruckRoutePage is required in TruckRouteDto"));

		Truck truck = truckService.getDefaultTruckForUser(user)
				.orElseThrow(() -> new ResourceNotFoundException("No default truck found for user: " + user.getId()));

		truckRoutePageDto.setTruck(truck);

		return freightMapper.toDto(truckRoutePageRepository.save(truckRoutePageDto));
	}


	public TruckRoutePageDto findById(String uid) {
		return truckRoutePageRepository.findById(uid).map(freightMapper::toDto)
				.orElseThrow(() -> new ResourceNotFoundException("No truck route pages found with ID: " + uid));
	}

	public TruckRoutePageDto save(TruckRoutePageDto truckRoutePageDto) {
		TruckRoutePage entity = freightMapper.toEntity(truckRoutePageDto);
		entity = truckRoutePageRepository.save(entity);
		return freightMapper.toDto(entity);
	}

	@Transactional
	public TruckRoutePageDto updateTruckRoutePage(String uid, TruckRoutePageDto truckRoutePageDto) {
		TruckRoutePage existingPage = truckRoutePageRepository.findById(uid)
				.orElseThrow(() -> new ResourceNotFoundException("Truck route page not found with ID: " + uid));

		existingPage.setDateFrom(truckRoutePageDto.getDateFrom());
		existingPage.setDateTo(truckRoutePageDto.getDateTo());
		existingPage.setTruck(freightMapper.toEntity(truckRoutePageDto.getTruck()));
		existingPage.setFuelBalanceAtStart(truckRoutePageDto.getFuelBalanceAtStart());

		TruckRoutePage updatedPage = truckRoutePageRepository.save(existingPage);

		return freightMapper.toDto(updatedPage);
	}

}
