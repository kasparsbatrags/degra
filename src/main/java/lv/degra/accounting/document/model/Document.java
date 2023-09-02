package lv.degra.accounting.document.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.distribution.model.Distribution;
import lv.degra.accounting.currency.model.Currency;
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

    @Size(max = 20)
    @NotNull
    @Column(name = "number", nullable = false, length = 20)
    private String number;

    @Size(max = 20)
    @Column(name = "internal_number", length = 20)
    private String internalNumber;

    @Column(name = "srs_type_id")
    private Integer srsTypeId;

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

    @NotNull
    @Column(name = "sum_total", nullable = false)
    private Double sumTotal;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
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

    @OneToMany(mappedBy = "document")
    private Set<Distribution> distributions = new LinkedHashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publisher_customer_id")
    private Customer publisherCustomer;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_customer_id", nullable = false)
    private Customer receiverCustomer;

}