package lv.degra.accounting.exchange.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.document.model.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "currency_exchange_rate")
public class CurrencyExchangeRate {
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

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_modified_at")
    private Instant lastModifiedAt;

    @OneToMany(mappedBy = "exchangeRate")
    private Set<Document> documents = new LinkedHashSet<>();

}