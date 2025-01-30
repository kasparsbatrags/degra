package lv.degra.accounting.core.account.chart.model;

import java.io.Serializable;
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
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.currency.model.Currency;

@Entity
@Table(name = "account_code_chart")
@Audited
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AccountCodeChart extends AuditInfo implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Size(max = 8)
	@NotNull
	@Column(name = "code", nullable = false, length = 8)
	private String code;

	@Size(max = 80)
	@NotNull
	@Column(name = "name", nullable = false, length = 80)
	private String name;

	@Column(name = "is_assets_account")
	private boolean isAssetsAccount;

	@Column(name = "use_for_bilance")
	private boolean useForBilance;

	@ManyToOne(fetch = FetchType.EAGER)
	@NotNull
	@JoinColumn(name = "currency_id")
	private Currency currency;

	@Column(name = "amount_in_account")
	private Double amountInAccount;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "parent_id")
	private AccountCodeChart parentAccount;

	@Override
	public String toString() {
		return getCode();
	}

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass())
			return false;
		AccountCodeChart that = (AccountCodeChart) o;
		return isAssetsAccount == that.isAssetsAccount && useForBilance == that.useForBilance && Objects.equals(id, that.id)
				&& Objects.equals(code, that.code) && Objects.equals(name, that.name) && Objects.equals(currency,
				that.currency) && Objects.equals(amountInAccount, that.amountInAccount) && Objects.equals(parentAccount,
				that.parentAccount);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, code, name, isAssetsAccount, useForBilance, currency, amountInAccount, parentAccount);
	}
}
