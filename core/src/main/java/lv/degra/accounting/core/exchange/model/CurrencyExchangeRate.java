package lv.degra.accounting.core.exchange.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

import org.hibernate.envers.Audited;

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
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.document.model.Document;

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

	@jakarta.validation.constraints.NotNull
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "currency_id", nullable = false)
	private Currency currency;

	@jakarta.validation.constraints.NotNull
	@Column(name = "rate_date", nullable = false)
	private LocalDate rateDate;

	@jakarta.validation.constraints.NotNull
	@Column(name = "rate", nullable = false)
	private Double rate;

	@OneToMany(mappedBy = "exchangeRate")
	private Set<Document> documents = new LinkedHashSet<>();

}