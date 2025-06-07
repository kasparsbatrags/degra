package lv.degra.accounting.core.truck_route.service;

import java.util.Optional;

import org.springframework.data.domain.Page;

import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;

public interface TruckRouteService {
	Page<TruckRouteDto> getLastTruckRoutesByUserId(String userId, int page, int size);

	TruckRouteDto createOrUpdateTruckRoute(TruckRouteDto truckRouteDto);

	Optional<TruckRouteDto> getLastTruckRouteByUserId(String userId);

	TruckRouteDto findById(String uid);

	Page<TruckRouteDto> getTruckRoutesByTruckRoutePageId(String truckRoutePageUid, int page, int size);

}
