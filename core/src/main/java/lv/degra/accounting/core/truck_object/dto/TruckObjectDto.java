package lv.degra.accounting.core.truck_object.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.truck_object.model.TruckObject;

/**
 * DTO for {@link TruckObject}
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TruckObjectDto implements Serializable {
	@NotNull
	private Integer id;
	@Size(max = 100)
	private String name;
}