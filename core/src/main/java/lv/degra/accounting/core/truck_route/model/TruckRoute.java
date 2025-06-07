package lv.degra.accounting.core.truck_route.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.document.bill.model.UnitType;
import lv.degra.accounting.core.truck_object.model.TruckObject;
import lv.degra.accounting.core.truck_route_page.model.TruckRoutePage;

@Getter
@Setter
@Entity
@Audited
@Table(name = "truck_route")
public class TruckRoute {
	@Id
	@Column(name = "uid", nullable = false, length = 36)
	private String uid;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "truck_route_page_uid", nullable = false)
	private TruckRoutePage truckRoutePage;

	@NotNull
	@Column(name = "route_date", nullable = false)
	private LocalDate routeDate;

	@Column(name = "route_number")
	private Integer routeNumber;

	@ColumnDefault("0")
	@Column(name = "cargo_valume")
	private Double cargoVolume;


	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "unit_type_id")
	private UnitType unitType;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "out_truck_object_uid", nullable = false)
	private TruckObject outTruckObject;

	@NotNull
	@Column(name = "odometer_at_start", nullable = false)
	private Long odometerAtStart;

	@NotNull
	@Column(name = "out_date_time", nullable = false)
	private Instant outDateTime;


	@Column(name = "odometer_at_finish")
	private Long odometerAtFinish;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "in_truck_object_uid")
	private TruckObject inTruckObject;

	@Column(name = "in_date_time")
	private Instant inDateTime;

	@Column(name = "route_length")
	private Long routeLength;

	@Column(name = "fuel_balance_at_start")
	private Double fuelBalanceAtStart;

	@Column(name = "fuel_received")
	private Double fuelReceived;

	@Column(name = "fuel_consumed")
	private Double fuelConsumed;

	@Column(name = "fuel_balance_at_finish")
	private Double fuelBalanceAtFinish;

	@Column(name = "created_date_time")
	private Instant createdDateTime;

	@Column(name = "last_modified_date_time")
	private Instant lastModifiedDateTime;

	@PrePersist
	public void generateUid() {
		if (this.uid == null) {
			this.uid = UUID.randomUUID().toString();
		}
	}

}
