package lv.degra.accounting.core.truck.route.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

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
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.truck.model.Truck;
import lv.degra.accounting.core.user.model.User;

@Getter
@Setter
@Entity
@Table(name = "truck_route")
public class TruckRoute extends AuditInfo implements Serializable {
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
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "truck_id", nullable = false)
	private Truck truck;

	@NotNull
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@NotNull
	@Column(name = "fuel_consumption_norm", nullable = false)
	private Double fuelConsumptionNorm;

	@NotNull
	@Column(name = "fuel_balance_at_start", nullable = false)
	private Double fuelBalanceAtStart;

	@NotNull
	@Column(name = "fuel_balance_at_end", nullable = false)
	private Double fuelBalanceAtEnd;

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		TruckRoute that = (TruckRoute) o;
		return Objects.equals(id, that.id) && Objects.equals(dateFrom, that.dateFrom) && Objects.equals(dateTo,
				that.dateTo) && Objects.equals(truck, that.truck) && Objects.equals(user, that.user)
				&& Objects.equals(fuelConsumptionNorm, that.fuelConsumptionNorm) && Objects.equals(fuelBalanceAtStart,
				that.fuelBalanceAtStart) && Objects.equals(fuelBalanceAtEnd, that.fuelBalanceAtEnd);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, dateFrom, dateTo, truck, user, fuelConsumptionNorm, fuelBalanceAtStart, fuelBalanceAtEnd);
	}
}