package lv.degra.accounting.core.truck_route.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.truck_route.model.TruckRouteRepository;
import lv.degra.accounting.core.user.model.User;
import lv.degra.accounting.core.user.service.UserService;

@Service
public class TruckRouteServiceImpl implements TruckRouteService {


	private final TruckRouteRepository truckRouteRepository;
	private final UserService userService;

	public TruckRouteServiceImpl(TruckRouteRepository truckRouteRepository, UserService userService) {
		this.truckRouteRepository = truckRouteRepository;
		this.userService = userService;
	}


	public List<TruckRoute> getLastTruckRoutesByUserId(String userId, int page, int size) {

		User user = userService.getByUserId(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

		Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
		Page<TruckRoute> truckRoutesPage = truckRouteRepository.findByUser(user, pageable);
		return truckRoutesPage.getContent();
	}
}
