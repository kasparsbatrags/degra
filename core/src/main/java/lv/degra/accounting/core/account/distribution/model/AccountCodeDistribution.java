package lv.degra.accounting.core.account.distribution.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.account.chart.model.AccountChart;
import lv.degra.accounting.core.document.model.Document;

@Getter
@Setter
@Entity
@Table(name = "account_code_distribution")
public class AccountCodeDistribution {
    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @NotNull
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "debit_account_id", nullable = false)
    private AccountChart debitAccount;

    @NotNull
    @Column(name = "amount_in_debit", nullable = false)
    private Double amountInDebit;

    @NotNull
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "credit_account_id", nullable = false)
	private AccountChart creditAccount;

    @NotNull
    @Column(name = "amount_in_credit", nullable = false)
    private Double amountInCredit;

}