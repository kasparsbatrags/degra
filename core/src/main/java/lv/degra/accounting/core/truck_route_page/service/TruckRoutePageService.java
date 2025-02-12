package lv.degra.accounting.core.truck_route_page.service;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck_route.dto.TruckRouteDto;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;
import lv.degra.accounting.core.user.model.User;

public interface TruckRoutePageService {
	List<TruckRoutePage> getUserRoutePages(String userId, int page, int size);

	List<TruckRoutePageDto> getUserRoutePagesDto(String userId, int page, int size);

	TruckRoutePageDto getOrCreateUserRoutePageByRouteDate(@NotNull TruckRouteDto truckRouteDto, @NotNull User user, @NotNull Truck truck);

	boolean userRoutePageByRouteDateExists(@NotNull LocalDate routeDate, @NotNull User user, @NotNull Truck truck);
}
