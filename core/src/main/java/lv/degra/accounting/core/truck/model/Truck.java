package lv.degra.accounting.core.truck.model;

import java.io.Serializable;
import java.util.Objects;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.user.model.User;

@Setter
@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Audited
public class Truck extends AuditInfo implements Serializable {

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
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	@NotAudited
	private User user;

	@NotNull
	@Size(max = 10)
	private String registrationNumber;

	@NotNull
	private Double fuelConsumptionNorm;

	@Override
	public String toString() {
		return "Truck{" +
				"id=" + id +
				", make='" + make + '\'' +
				", model='" + model + '\'' +
				", registrationNumber='" + registrationNumber + '\'' +
				", fuelConsumptionNorm=" + fuelConsumptionNorm +
				'}';
	}

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		Truck truck = (Truck) o;
		return Objects.equals(id, truck.id) && Objects.equals(make, truck.make) && Objects.equals(model,
				truck.model) && Objects.equals(registrationNumber, truck.registrationNumber) && Objects.equals(
				fuelConsumptionNorm, truck.fuelConsumptionNorm);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, make, model, registrationNumber, fuelConsumptionNorm);
	}
}
