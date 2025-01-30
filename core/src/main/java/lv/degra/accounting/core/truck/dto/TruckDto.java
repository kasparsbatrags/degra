package lv.degra.accounting.core.truck.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

/**
 * DTO for {@link lv.degra.accounting.core.truck.model.Truck}
 */
@Value
public class TruckDto implements Serializable {
	@NotNull
	Integer id;
	@NotNull
	@Size(max = 20)
	String make;
	@NotNull
	@Size(max = 20)
	String model;
	@NotNull
	@Size(max = 10)
	String registrationNumber;
}