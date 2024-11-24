package lv.degra.accounting.core.account.posted.model;

import java.io.Serializable;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.document.model.Document;

@Entity
@Setter
@Getter
@Audited
public class AccountPosted extends AuditInfo implements Serializable {
	@Id
	@Column(name = "id", nullable = false)
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "document_id", nullable = false)
	private Document document;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "debit_account_id", nullable = false)
	private AccountCodeChart debitAccount;

	@NotNull
	@Column(name = "amount", nullable = false)
	private Double amount;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "credit_account_id", nullable = false)
	private AccountCodeChart creditAccount;

}