package lv.degra.accounting.core.truck_route_cargo_type_map.model;

import java.time.Instant;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.cargo_type.model.CargoType;
import lv.degra.accounting.core.truck_route.model.TruckRoute;

@Getter
@Setter
@Entity
@Audited
@Table(name = "truck_route_cargo_type_map")
public class TruckRouteCargoTypeMap {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@NotNull
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "truck_route_id", nullable = false)
	private TruckRoute truckRoute;

	@NotNull
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "cargo_type_id", nullable = false)
	private CargoType cargoType;

	@ColumnDefault("now()")
	@Column(name = "created_date_time")
	private Instant createdDateTime;

	@ColumnDefault("now()")
	@Column(name = "last_modified_date_time")
	private Instant lastModifiedDateTime;

}