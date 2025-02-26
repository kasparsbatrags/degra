package lv.degra.accounting.core.truck_route_page.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.truck_route.model.TruckRoute;
import lv.degra.accounting.core.user.model.User;

@Getter
@Setter
@Entity
@Audited
@Table(name = "truck_route_page")
public class TruckRoutePage extends AuditInfo implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@NotNull
	@Column(name = "date_from", nullable = false)
	private LocalDate dateFrom;

	@Column(name = "date_to")
	private LocalDate dateTo;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "truck_id", nullable = false)
	private Truck truck;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	@NotAudited
	private User user;

	@Column(name = "fuel_balance_at_start", nullable = false)
	private Double fuelBalanceAtStart;

	@Column(name = "fuel_balance_at_end", nullable = false)
	private Double fuelBalanceAtFinish;

	@OneToMany(mappedBy = "truckRoutePage", fetch = FetchType.EAGER)
	private List<TruckRoute> routes;

	@Transient
	private Double totalFuelReceivedOnRoutes;

	@Transient
	private Double totalFuelConsumedOnRoutes;

	@Transient
	private Double fuelBalanceAtRoutesFinish;


	@Transient
	private Long odometerAtRouteStart;

	@Transient
	private Long odometerAtRouteFinish;

	@Transient
	private Long computedTotalRoutesLength;


	public void calculateSummary() {
		if (routes != null && !routes.isEmpty()) {
			routes.sort(Comparator.comparing(TruckRoute::getOutDateTime));
			this.odometerAtRouteStart = routes.getFirst().getOdometerAtStart();

			routes.sort(Comparator.comparing(TruckRoute::getOutDateTime).reversed());
			this.odometerAtRouteFinish = routes.getFirst().getOdometerAtFinish();
			this.fuelBalanceAtRoutesFinish = routes.getFirst().getFuelBalanceAtFinish();

			this.totalFuelConsumedOnRoutes  = routes.stream()
					.mapToDouble(route -> Optional.ofNullable(route.getFuelConsumed()).orElse((double) 0))
					.sum();
			this.computedTotalRoutesLength = routes.stream()
					.mapToLong(route -> Optional.ofNullable(route.getRouteLength()).orElse(0L))
					.sum();

			this.totalFuelReceivedOnRoutes  = routes.stream()
					.mapToDouble(route -> Optional.ofNullable(route.getFuelReceived()).orElse(Double.valueOf(0)))
					.sum();

		}
	}


}