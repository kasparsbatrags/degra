package lv.degra.accounting.document.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;
import lv.degra.accounting.distribution.model.Distribution;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "document")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "direction_id")
	@Enumerated(EnumType.ORDINAL)
	private DocumentDirection direction;

    @Column(name = "document_number", nullable = false)
    private Integer documentNumber;

	@Size(max = 20)
	@Column(name = "document_series", length = 20)
	private String documentSeries;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "document_type_id", nullable = false)
	private DocumentType documentType;

	@NotNull
	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "document_transaction_type_id")
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

    @Column(name = "sum_total", nullable = false)
    private Double sumTotal;

    @Column(name = "sum_total_in_currency", nullable = false)
    private Double sumTotalInCurrency;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "exchange_rate_id", nullable = false)
    private CurrencyExchangeRate exchangeRate;

    @Column(name = "notes_for_customer", length = Integer.MAX_VALUE)
    private String notesForCustomer;

    @Column(name = "internal_notes", length = Integer.MAX_VALUE)
    private String internalNotes;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_modified_at")
    private Instant lastModifiedAt;

    @OneToMany(mappedBy = "document", fetch = FetchType.EAGER)
    private Set<Distribution> distributions = new LinkedHashSet<>();

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "publisher_customer_id")
    private Customer publisherCustomer;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "publisher_customer_bank_id", nullable = false)
    private Bank publisherCustomerBank;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "publisher_customer_bank_account_id")
    private CustomerBankAccount publisherCustomerBankAccount;


    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "receiver_customer_id", nullable = false)
    private Customer receiverCustomer;


    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "receiver_customer_bank_id", nullable = false)
    private Bank receiverCustomerBank;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_customer_bank_account_id")
    private CustomerBankAccount receiverCustomerBankAccount;


}