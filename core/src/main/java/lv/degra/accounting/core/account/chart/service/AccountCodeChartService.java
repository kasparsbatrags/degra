package lv.degra.accounting.core.account.chart.service;

import java.util.List;

import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.system.DataFetchService;

public interface AccountCodeChartService extends DataFetchService {
	List<AccountCodeChart> getAccountCodeChart();

	List<AccountCodeChart> getSuggestions(String searchText);
}
