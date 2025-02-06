package lv.degra.accounting.core.truck_route.dto;

import java.io.Serializable;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.user.dto.UserDto;

/**
 * DTO for {@link TruckRoute}
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TruckRouteDto implements Serializable {
	private Integer id;
	@NotNull
	private LocalDate dateFrom;
	private LocalDate dateTo;
	@NotNull
	private TruckDto truck;
	@NotNull
	private UserDto user;
	@NotNull
	private Double fuelConsumptionNorm;
	@NotNull
	private Double fuelBalanceAtStart;
	@NotNull
	private Double fuelBalanceAtEnd;
}