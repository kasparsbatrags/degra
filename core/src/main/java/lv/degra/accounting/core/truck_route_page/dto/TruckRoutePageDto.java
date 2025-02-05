package lv.degra.accounting.core.truck_route_page.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Value;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;
import lv.degra.accounting.core.user.dto.UserDto;

/**
 * DTO for {@link TruckRoutePage}
 */
@Value
public class TruckRoutePageDto implements Serializable {
	LocalDateTime createdDateTime;
	LocalDateTime lastModifiedDateTime;
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