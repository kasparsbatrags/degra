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

	@Transient
	private Integer totalFuelReceived;

	@OneToMany(mappedBy = "truckRoutePage", fetch = FetchType.EAGER)
	private List<TruckRoute> routes;

	@Transient
	private Long calculatedOdometerAtStart;

	@Transient
	private Long calculatedOdometerAtFinish;

	@Transient
	private Long calculatedTotalRouteLength;


	public void calculateSummary() {
		if (routes != null && !routes.isEmpty()) {
			routes.sort(Comparator.comparing(TruckRoute::getOutDateTime));
			this.calculatedOdometerAtStart = routes.getFirst().getOdometerAtStart();

			routes.sort(Comparator.comparing(TruckRoute::getOutDateTime).reversed());
			this.calculatedOdometerAtFinish = routes.getFirst().getOdometerAtFinish();

			this.calculatedTotalRouteLength = routes.stream()
					.mapToLong(route -> Optional.ofNullable(route.getRouteLength()).orElse(0L))
					.sum();

			this.totalFuelReceived = routes.stream()
					.mapToInt(route -> Optional.ofNullable(route.getFuelReceived()).orElse(0))
					.sum();

		}
	}


}