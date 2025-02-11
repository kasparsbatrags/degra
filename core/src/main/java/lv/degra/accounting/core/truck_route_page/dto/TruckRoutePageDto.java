package lv.degra.accounting.core.truck_route_page.dto;

import java.io.Serializable;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;
import lv.degra.accounting.core.user.model.User;

/**
 * DTO for {@link TruckRoutePage}
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TruckRoutePageDto implements Serializable {
	private Integer id;
	@NotNull
	private LocalDate dateFrom;
	private LocalDate dateTo;
	private Truck truck;
	private User user;
	@NotNull
	private String truckRegistrationNumber;
	@NotNull
	private Double fuelConsumptionNorm;
	@NotNull
	private Double fuelBalanceAtStart;
	@NotNull
	private Double fuelBalanceAtEnd;
}