package lv.degra.accounting.core.truck_route_page.service;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;
import lv.degra.accounting.core.user.model.User;

public interface TruckRoutePageService {
	List<TruckRoutePage> getUserRoutePages(String userId, int page, int size);

	List<TruckRoutePageDto> getUserRoutePagesDto(String userId, int page, int size);

	TruckRoutePageDto getOrCreateUserRoutePageByRouteDate(@NotNull TruckRouteDto truckRouteDto, @NotNull User user, @NotNull TruckDto truckDto);

	TruckRoutePageDto userRoutePageByRouteDateExists(LocalDate routeDate, String userId, String truckUid);

	TruckRoutePageDto findById(String uid);

	TruckRoutePageDto save(@NotNull TruckRoutePageDto truckRoutePageDto);

	TruckRoutePageDto updateTruckRoutePage(String uid, TruckRoutePageDto truckRoutePageDto);
}
