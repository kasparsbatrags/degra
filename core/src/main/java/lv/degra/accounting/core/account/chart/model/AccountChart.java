package lv.degra.accounting.core.account.chart.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import lv.degra.accounting.core.currency.model.Currency;

@Getter
@Setter
@Entity
@Table(name = "account_chart")
@AllArgsConstructor
@NoArgsConstructor
public class AccountChart {

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

	@ManyToOne
	@NotNull
	@JoinColumn(name = "currency_id")
	private Currency currency;

	@Column(name = "amount_in_account")
	private Double amountInAccount;

	@ManyToOne
	@JoinColumn(name = "parent_account_id")
	private AccountChart parentAccount;

}
