package lv.degra.accounting.core.truck_route_page.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.config.mapper.FreightMapper;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePageRepository;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;

@Service
public class TruckRoutePageServiceImpl implements TrackRoutePageService {

	private final TruckRoutePageRepository truckRoutePageRepository;
	private final UserService userService;
	private final FreightMapper freightMapper;

	public TruckRoutePageServiceImpl(TruckRoutePageRepository truckRoutePageRepository, UserService userService,
			FreightMapper freightMapper) {
		this.truckRoutePageRepository = truckRoutePageRepository;
		this.userService = userService;
		this.freightMapper = freightMapper;
	}

	public List<TruckRoutePage> getUserRoutePages(String userId, int page, int size) {
		User user = userService.getByUserId(userId).orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

		Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
		Page<TruckRoutePage> truckRoutesPage = truckRoutePageRepository.findByUser(user, pageable);
		return truckRoutesPage.getContent();

	}

	public List<TruckRoutePageDto> getUserRoutePagesDto(String userId, int page, int size) {
		List<TruckRoutePage> truckRoutePageList = getUserRoutePages(userId, page, size);
		return truckRoutePageList.stream().map(freightMapper::toDto).toList();
	}

}


