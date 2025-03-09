package lv.degra.accounting.core.document.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import jakarta.persistence.CascadeType;
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
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.posted.model.AccountPosted;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.customer.model.Customer;
import lv.degra.accounting.core.customer_account.model.CustomerAccount;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRate;

@Getter
@Setter
@Entity
@Table(name = "document")
@Audited
public class Document extends AuditInfo implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "document_number", nullable = false, length = 20)
	private String documentNumber;

	@Size(max = 20)
	@Column(name = "document_series", length = 20)
	private String documentSeries;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "document_sub_type_id", nullable = false)
	@NotAudited
	private DocumentSubType documentSubType;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "document_transaction_type_id")
	@NotAudited
	private DocumentTransactionType documentTransactionType;

	@NotNull
	@Column(name = "accounting_date", nullable = false)
	private LocalDate accountingDate;

	@NotNull
	@Column(name = "document_date", nullable = false)
	private LocalDate documentDate;

	@Column(name = "payment_date")
	private LocalDate paymentDate;

	@Column(name = "payment_type_id")
	private Integer paymentTypeId;

	@PositiveOrZero(message = "Amount must be positive or 0")
	@Column(name = "sum_total", nullable = false)
	private Double sumTotal;

	@PositiveOrZero(message = "Amount in currency must be positive or 0")
	@Column(name = "sum_total_in_currency", nullable = false)
	private Double sumTotalInCurrency;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "currency_id", nullable = false)
	@NotAudited
	private Currency currency;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "exchange_rate_id", nullable = false)
	private CurrencyExchangeRate exchangeRate;

	@Column(name = "notes_for_customer", length = Integer.MAX_VALUE)
	private String notesForCustomer;

	@Column(name = "internal_notes", length = Integer.MAX_VALUE)
	private String internalNotes;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "publisher_customer_id")
	private Customer publisherCustomer;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "publisher_customer_bank_id")
	private Bank publisherCustomerBank;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "publisher_customer_bank_account_id")
	private CustomerAccount publisherCustomerBankAccount;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "receiver_customer_id")
	private Customer receiverCustomer;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "receiver_customer_bank_id")
	private Bank receiverCustomerBank;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "receiver_customer_bank_account_id")
	private CustomerAccount receiverCustomerBankAccount;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "document_status_id")
	@NotAudited
	private DocumentStatus documentStatus;

	@OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
	private List<AccountPosted> accountPostedList;

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		Document document = (Document) o;
		return Objects.equals(id, document.id) && Objects.equals(documentNumber, document.documentNumber)
				&& Objects.equals(documentSeries, document.documentSeries) && Objects.equals(documentSubType,
				document.documentSubType) && Objects.equals(documentTransactionType, document.documentTransactionType)
				&& Objects.equals(accountingDate, document.accountingDate) && Objects.equals(documentDate,
				document.documentDate) && Objects.equals(paymentDate, document.paymentDate) && Objects.equals(paymentTypeId,
				document.paymentTypeId) && Objects.equals(sumTotal, document.sumTotal) && Objects.equals(sumTotalInCurrency,
				document.sumTotalInCurrency) && Objects.equals(currency, document.currency) && Objects.equals(exchangeRate,
				document.exchangeRate) && Objects.equals(notesForCustomer, document.notesForCustomer) && Objects.equals(
				internalNotes, document.internalNotes) && Objects.equals(publisherCustomer, document.publisherCustomer)
				&& Objects.equals(publisherCustomerBank, document.publisherCustomerBank) && Objects.equals(
				publisherCustomerBankAccount, document.publisherCustomerBankAccount) && Objects.equals(receiverCustomer,
				document.receiverCustomer) && Objects.equals(receiverCustomerBank, document.receiverCustomerBank)
				&& Objects.equals(receiverCustomerBankAccount, document.receiverCustomerBankAccount) && Objects.equals(
				documentStatus, document.documentStatus) && Objects.equals(accountPostedList, document.accountPostedList);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, documentNumber, documentSeries, documentSubType, documentTransactionType, accountingDate, documentDate,
				paymentDate, paymentTypeId, sumTotal, sumTotalInCurrency, currency, exchangeRate, notesForCustomer, internalNotes,
				publisherCustomer, publisherCustomerBank, publisherCustomerBankAccount, receiverCustomer, receiverCustomerBank,
				receiverCustomerBankAccount, documentStatus, accountPostedList);
	}
}
