package lv.degra.accounting.core.truck_route.service;

import java.util.List;

import lv.degra.accounting.core.truck_route.model.TruckRoute;

public interface TruckRouteService {
	List<TruckRoute> getLastTruckRoutesByUserId(String userId, int page, int size);
}
