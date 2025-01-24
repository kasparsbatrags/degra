package lv.degra.accounting.core.truck.route.service;

import java.util.List;

import lv.degra.accounting.core.truck.route.model.TruckRoute;

public interface TruckRouteService {
	List<TruckRoute> getLastTruckRoutesByUserId(Integer userId, int page, int size);
}
