package lv.degra.accounting.core.account.chart.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import lv.degra.accounting.core.account.chart.model.AccountCodeChartRepository;

@Service
public class AccountCodeChartServiceImpl implements AccountCodeChartService {

	private final AccountCodeChartRepository accountChartRepository;

	@Autowired
	public AccountCodeChartServiceImpl(AccountCodeChartRepository accountChartRepository) {
		this.accountChartRepository = accountChartRepository;
	}

	public List<AccountCodeChart> getAccountCodeChart() {
		return accountChartRepository.findByIsAssetsAccountFalse();
	}

	@Override
	public List<AccountCodeChart> getSuggestions(String searchText) {
		return accountChartRepository.getSuggestions(searchText);
	}
}


