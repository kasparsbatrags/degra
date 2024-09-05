package lv.degra.accounting.core.account.chart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.currency.model.Currency;

import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "account_code_chart")
@AllArgsConstructor
@NoArgsConstructor
public class AccountCodeChart implements Serializable {

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

}
