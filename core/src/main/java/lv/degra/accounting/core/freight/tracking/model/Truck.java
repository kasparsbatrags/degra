package lv.degra.accounting.core.freight.tracking.model;

import java.util.Objects;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Audited
public class Truck {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@NotNull
	@Size(max = 20)
	private String make;

	@NotNull
	@Size(max = 20)
	private String model;

	@NotNull
	@Size(max = 10)
	private String registrationNumber;

	@Override
	public String toString() {
		return "Truck{" +
				"id=" + id +
				", make='" + make + '\'' +
				", model='" + model + '\'' +
				", registrationNumber='" + registrationNumber + '\'' +
				'}';
	}

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		Truck truck = (Truck) o;
		return Objects.equals(id, truck.id) && Objects.equals(make, truck.make) && Objects.equals(model,
				truck.model) && Objects.equals(registrationNumber, truck.registrationNumber);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, make, model, registrationNumber);
	}
}
