package lv.degra.accounting.core.account.chart.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.currency.model.Currency;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AccountCodeChartDto implements Serializable {

	private Integer id;
	private String code;
	private String name;
	private boolean isAssetsAccount;
	private boolean useForBilance;
	private Currency currency;
	private AccountCodeChartDto parentAccount;
}
