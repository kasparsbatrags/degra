package lv.degra.accounting.core.truck_route_page.dto;

import java.io.Serializable;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.truck.dto.TruckDto;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;
import lv.degra.accounting.core.user.dto.UserManagementDto;

/**
 * DTO for {@link TruckRoutePage}
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TruckRoutePageDto implements Serializable {
	private String uid;
	@NotNull
	private LocalDate dateFrom;
	private LocalDate dateTo;
	private TruckDto truck;
	private UserManagementDto user;
	@NotNull
	private Double fuelBalanceAtStart;
	private Double fuelBalanceAtFinish;

	private String truckRegistrationNumber;
	private Double fuelConsumptionNorm;

	private Double totalFuelReceivedOnRoutes;
	private Double totalFuelConsumedOnRoutes;
	private Double fuelBalanceAtRoutesFinish;
	private Long odometerAtRouteStart;
	private Long odometerAtRouteFinish;
	private Long computedTotalRoutesLength;
}
