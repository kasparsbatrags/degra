package lv.degra.accounting.core.account.chart.service;

import lv.degra.accounting.core.account.chart.model.AccountCodeChart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.account.chart.model.AccountCodeChartRepository;

import java.util.List;

@Service
public class AccountCodeChartServiceImpl implements AccountCodeChartService {

	private final AccountCodeChartRepository accountChartRepository;

	@Autowired
	public AccountCodeChartServiceImpl(AccountCodeChartRepository accountChartRepository) {
		this.accountChartRepository = accountChartRepository;
	}

	public List<AccountCodeChart> getAccountCodeChart() {
		return accountChartRepository.getNonAssets();
	}
}
