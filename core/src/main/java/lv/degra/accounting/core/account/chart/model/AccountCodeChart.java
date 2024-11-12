package lv.degra.accounting.core.account.chart.model;

import java.io.Serializable;

import org.hibernate.envers.AuditTable;
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
import lombok.NoArgsConstructor;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.currency.model.Currency;

@Entity
@Table(name = "account_code_chart")
@Audited
@AuditTable(value = "account_code_chart_audit")
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

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public @Size(max = 8) @NotNull String getCode() {
		return code;
	}

	public void setCode(@Size(max = 8) @NotNull String code) {
		this.code = code;
	}

	public @Size(max = 80) @NotNull String getName() {
		return name;
	}

	public void setName(@Size(max = 80) @NotNull String name) {
		this.name = name;
	}

	public boolean isAssetsAccount() {
		return isAssetsAccount;
	}

	public void setAssetsAccount(boolean assetsAccount) {
		isAssetsAccount = assetsAccount;
	}

	public boolean isUseForBilance() {
		return useForBilance;
	}

	public void setUseForBilance(boolean useForBilance) {
		this.useForBilance = useForBilance;
	}

	public @NotNull Currency getCurrency() {
		return currency;
	}

	public void setCurrency(@NotNull Currency currency) {
		this.currency = currency;
	}

	public Double getAmountInAccount() {
		return amountInAccount;
	}

	public void setAmountInAccount(Double amountInAccount) {
		this.amountInAccount = amountInAccount;
	}

	public AccountCodeChart getParentAccount() {
		return parentAccount;
	}

	public void setParentAccount(AccountCodeChart parentAccount) {
		this.parentAccount = parentAccount;
	}

	@Override
	public String toString() {
		return getCode();
	}
}
