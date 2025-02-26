package lv.degra.accounting.core.truck_route.dto;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.document.bill.model.UnitType;
import lv.degra.accounting.core.truck_object.dto.TruckObjectDto;
import lv.degra.accounting.core.truck_route_page.dto.TruckRoutePageDto;

/**
 * DTO for {@link lv.degra.accounting.core.truck_route.model.TruckRoute}
 */
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TruckRouteDto implements Serializable {
	private Integer id;

	private TruckRoutePageDto truckRoutePage;
	@NotNull
	private LocalDate routeDate;

	@Positive
	private Integer routeNumber;
	private Double cargoVolume;
	private UnitType unitType;

	@NotNull
	private TruckObjectDto outTruckObject;
	private Instant outDateTime;
	@NotNull
	@Positive
	private Long odometerAtStart;

	private TruckObjectDto inTruckObject;
	private Instant inDateTime;
	@Positive
	private Long odometerAtFinish;
	private Integer routeLength;


	private Double fuelBalanceAtStart;
	private Double fuelConsumed;
	private Double fuelReceived;
	private Double fuelBalanceAtFinish;
}