package lv.degra.accounting.core.truck.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for {@link lv.degra.accounting.core.truck.model.Truck}
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TruckDto implements Serializable {
	@NotNull
	private Integer id;
	@NotNull
	@Size(max = 20)
	private String truckMaker;
	@NotNull
	@Size(max = 20)
	private String truckModel;
	@NotNull
	@Size(max = 10)
	private String registrationNumber;
	@NotNull
	private Double fuelConsumptionNorm;
	private Boolean isDefault = false;

}