package lv.degra.accounting.core.exchange.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

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
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.currency.model.Currency;

@Getter
@Setter
@Entity
@Table(name = "currency_exchange_rate")
@Audited
public class CurrencyExchangeRate extends AuditInfo implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "currency_id", nullable = false)
	private Currency currency;

	@NotNull
	@Column(name = "rate_date", nullable = false)
	private LocalDate rateDate;

	@NotNull
	@Column(name = "rate", nullable = false)
	private Double rate;

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		CurrencyExchangeRate that = (CurrencyExchangeRate) o;
		return Objects.equals(id, that.id) && Objects.equals(currency, that.currency) && Objects.equals(rateDate,
				that.rateDate) && Objects.equals(rate, that.rate);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, currency, rateDate, rate);
	}
}