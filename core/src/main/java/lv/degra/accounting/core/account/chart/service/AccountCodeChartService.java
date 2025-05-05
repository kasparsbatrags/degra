package lv.degra.accounting.core.account.chart.service;

import java.util.List;

import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.system.DataFetcher;

public interface AccountCodeChartService extends DataFetcher<AccountCodeChart> {
	List<AccountCodeChart> getAccountCodeChart();

	List<AccountCodeChart> getSuggestions(String searchText);
}
