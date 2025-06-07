package lv.degra.accounting.core.truck.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.hibernate.envers.Audited;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
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
@Audited
@Table(name = "truck")
public class Truck extends AuditInfo implements Serializable {

	@Id
	@Column(name = "uid", nullable = false, length = 36)
	private String uid;

	@Column(name = "truck_maker", nullable = false, length = 20)
	private String truckMaker;

	@Column(name = "truck_model", nullable = false, length = 20)
	private String truckModel;

	@Column(name = "registration_number", nullable = false, length = 10)
	private String registrationNumber;

	@Column(name = "fuel_consumption_norm", nullable = false)
	private Double fuelConsumptionNorm;

	@OneToMany(mappedBy = "truck", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
	private List<TruckUserMap> userMappings = new ArrayList<>();

	public void addUserMapping(TruckUserMap mapping) {
		this.userMappings.add(mapping);
		mapping.setTruck(this);
	}

	public void removeUserMapping(TruckUserMap mapping) {
		this.userMappings.remove(mapping);
		mapping.setTruck(null);
	}

	@PrePersist
	public void generateUid() {
		if (this.uid == null) {
			this.uid = java.util.UUID.randomUUID().toString();
		}
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Truck truck = (Truck) o;
		return Objects.equals(uid, truck.uid) &&
				Objects.equals(truckMaker, truck.truckMaker) &&
				Objects.equals(truckModel, truck.truckModel) &&
				Objects.equals(registrationNumber, truck.registrationNumber) &&
				Objects.equals(fuelConsumptionNorm, truck.fuelConsumptionNorm);
	}

	@Override
	public int hashCode() {
		return Objects.hash(uid, truckMaker, truckModel, registrationNumber, fuelConsumptionNorm);
	}
}
