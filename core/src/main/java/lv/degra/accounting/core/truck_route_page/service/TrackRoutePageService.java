package lv.degra.accounting.core.truck_route_page.service;

import java.util.List;

import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;

public interface TrackRoutePageService {
	List<TruckRoutePage> getUserRoutePages(String userId, int page, int size);

	List<TruckRoutePageDto> getUserRoutePagesDto(String userId, int page, int size);
}
