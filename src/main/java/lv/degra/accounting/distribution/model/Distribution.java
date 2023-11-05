package lv.degra.accounting.distribution.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.document.model.Document;

@Getter
@Setter
@Entity
@Table(name = "distribution")
public class Distribution {
    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @NotNull
    @Column(name = "debit_account_id", nullable = false)
    private Integer debitAccountId;

    @NotNull
    @Column(name = "amount_in_debit", nullable = false)
    private Double amountInDebit;

    @NotNull
    @Column(name = "credit_account_id", nullable = false)
    private Integer creditAccountId;

    @NotNull
    @Column(name = "amount_in_credit", nullable = false)
    private Double amountInCredit;

}