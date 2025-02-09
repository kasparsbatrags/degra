package lv.degra.accounting.core.cargo_type.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for {@link lv.degra.accounting.core.cargo_type.model.CargoType}
 */
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CargoTypeDto implements Serializable {
	Integer id;
	@NotNull
	@Size(max = 254)
	String name;
}