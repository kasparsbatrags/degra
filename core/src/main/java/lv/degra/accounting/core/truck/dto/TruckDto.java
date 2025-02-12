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
	@Size(max = 20)
	private String truckMaker;
	@Size(max = 20)
	private String truckModel;
	@Size(max = 10)
	private String registrationNumber;
	private Double fuelConsumptionNorm;
	private Boolean isDefault = false;

}