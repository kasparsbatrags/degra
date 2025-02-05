package lv.degra.accounting.core.truck_route.dto;

import java.io.Serializable;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Value;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.user.dto.UserDto;

/**
 * DTO for {@link TruckRoute}
 */
@Value
public class TruckRouteDto implements Serializable {
	Integer id;
	@NotNull
	LocalDate dateFrom;
	LocalDate dateTo;
	@NotNull
	TruckDto truck;
	@NotNull
	UserDto user;
	@NotNull
	Double fuelConsumptionNorm;
	@NotNull
	Double fuelBalanceAtStart;
	@NotNull
	Double fuelBalanceAtEnd;
}