package lv.degra.accounting.core.truck_route_page.service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.config.mapper.FreightMapper;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck.service.TruckService;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePageRepository;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;

@Service
public class TruckRoutePageServiceImpl implements TruckRoutePageService {

	private final TruckRoutePageRepository truckRoutePageRepository;
	private final UserService userService;
	private final TruckService truckService;
	private final FreightMapper freightMapper;

	public TruckRoutePageServiceImpl(TruckRoutePageRepository truckRoutePageRepository, UserService userService, TruckService truckService,
			FreightMapper freightMapper) {
		this.truckRoutePageRepository = truckRoutePageRepository;
		this.userService = userService;
		this.truckService = truckService;
		this.freightMapper = freightMapper;
	}

	public List<TruckRoutePage> getUserRoutePages(String userId, int page, int size) {
		User user = userService.getByUserId(userId).orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

		return truckRoutePageRepository.findByUser(user, PageRequest.of(page, size, Sort.by(Sort.Order.desc("id")))).getContent();
	}

	public List<TruckRoutePageDto> getUserRoutePagesDto(String userId, int page, int size) {
		return getUserRoutePages(userId, page, size).stream().map(freightMapper::toDto).toList();
	}

	public TruckRoutePageDto getOrCreateUserRoutePageByRouteDate(TruckRouteDto truckRouteDto, User user) {
		return truckRoutePageRepository.findByUserAndRouteDate(user, truckRouteDto.getRouteDate())
				.map(freightMapper::toDto)
				.orElseGet(() -> {
					TruckRoutePage newTruckRoutePage = new TruckRoutePage();
					LocalDate routeDate = truckRouteDto.getRouteDate();
					newTruckRoutePage.setDateFrom(routeDate.withDayOfMonth(1));
					newTruckRoutePage.setDateTo(routeDate.with(TemporalAdjusters.lastDayOfMonth()));
					Truck userTruck = truckService.getTruckByUser(user);
					newTruckRoutePage.setTruck(userTruck);
					newTruckRoutePage.setUser(user);
					newTruckRoutePage.setFuelBalanceAtStart(truckRouteDto.getFuelBalanceAtStart());
					return freightMapper.toDto(truckRoutePageRepository.save(newTruckRoutePage));
				});
	}

}


