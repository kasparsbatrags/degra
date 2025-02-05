package lv.degra.accounting.core.truck_object.dto;

import java.io.Serializable;

import jakarta.validation.constraints.Size;
import lombok.Value;
import lv.degra.accounting.core.truck_object.model.TruckObject;

/**
 * DTO for {@link TruckObject}
 */
@Value
public class TruckObjectDto implements Serializable {
	Integer id;
	@Size(max = 100)
	String name;
}