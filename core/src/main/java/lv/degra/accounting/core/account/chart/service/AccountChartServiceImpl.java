package lv.degra.accounting.core.account.chart.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.account.chart.model.AccountChartRepository;

@Service
public class AccountChartServiceImpl implements AccountChartService {

	private final AccountChartRepository accountChartRepository;

	@Autowired
	public AccountChartServiceImpl(AccountChartRepository accountChartRepository) {
		this.accountChartRepository = accountChartRepository;
	}
}
