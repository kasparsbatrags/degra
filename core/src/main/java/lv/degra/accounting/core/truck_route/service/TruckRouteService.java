package lv.degra.accounting.core.truck_route.service;

import java.util.Optional;

import org.springframework.data.domain.Page;

import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route.model.TruckRoute;

public interface TruckRouteService {
	Page<TruckRouteDto> getLastTruckRoutesByUserId(String userId, int page, int size);

	TruckRouteDto createOrUpdateTrucRoute(TruckRouteDto truckRouteDto);

	Optional<TruckRouteDto> getLastTruckRouteByUserId(String userId);

	Optional<TruckRoute> findById(Integer id);
}
