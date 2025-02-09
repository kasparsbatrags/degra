package lv.degra.accounting.core.truck.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.hibernate.envers.Audited;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMap;

@Setter
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
@Table(name = "truck")
public class Truck extends AuditInfo implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "truck_maker", nullable = false, length = 20)
	private String truckMaker;

	@Column(name = "truck_model", nullable = false, length = 20)
	private String truckModel;

	@Column(name = "registration_number", nullable = false, length = 10)
	private String registrationNumber;

	@Column(name = "fuel_consumption_norm", nullable = false)
	private Double fuelConsumptionNorm;

	@OneToMany(mappedBy = "truck", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<TruckUserMap> userMappings = new ArrayList<>();

	public void addUserMapping(TruckUserMap mapping) {
		this.userMappings.add(mapping);
		mapping.setTruck(this);
	}

	public void removeUserMapping(TruckUserMap mapping) {
		this.userMappings.remove(mapping);
		mapping.setTruck(null);
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Truck truck = (Truck) o;
		return Objects.equals(id, truck.id) &&
				Objects.equals(truckMaker, truck.truckMaker) &&
				Objects.equals(truckModel, truck.truckModel) &&
				Objects.equals(registrationNumber, truck.registrationNumber) &&
				Objects.equals(fuelConsumptionNorm, truck.fuelConsumptionNorm);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, truckMaker, truckModel, registrationNumber, fuelConsumptionNorm);
	}
}
