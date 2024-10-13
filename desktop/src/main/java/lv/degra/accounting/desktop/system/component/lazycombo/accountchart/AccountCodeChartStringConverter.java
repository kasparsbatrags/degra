package lv.degra.accounting.desktop.system.component.lazycombo.accountchart;

import org.springframework.stereotype.Component;

import javafx.util.StringConverter;
import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.chart.service.AccountCodeChartService;

@Component
public class AccountCodeChartStringConverter extends StringConverter<AccountCodeChart> {

	private final AccountCodeChartService accountCodeChartService;

	public AccountCodeChartStringConverter(AccountCodeChartService accountCodeChartService) {
		this.accountCodeChartService = accountCodeChartService;
	}

	@Override
	public String toString(AccountCodeChart accountCodeChart) {
		if (accountCodeChart == null) {
			return "";
		}
		return accountCodeChart.getCode() + " - " + accountCodeChart.getName();
	}

	@Override
	public AccountCodeChart fromString(String string) {
		if (string == null || string.trim().isEmpty()) {
			return null;
		}
		String[] parts = string.split(" - ");
		if (parts.length != 2) {
			return null;
		}
		String code = parts[0].trim();
		return accountCodeChartService.getSuggestions(code).stream().filter(accountCodeChart -> accountCodeChart.getCode().equals(code))
				.findFirst().orElse(null);
	}
}