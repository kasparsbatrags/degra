package lv.degra.accounting.core.currency.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.currency.model.CurrencyRepository;

@Service
public class CurrencyServiceImpl implements CurrencyService {

	private static final String DEFAULT_CURRENCY_NAME = "EUR";

	private final CurrencyRepository currencyRepository;

	@Autowired
	public CurrencyServiceImpl(CurrencyRepository currencyRepository) {
		this.currencyRepository = currencyRepository;
	}

	public List<Currency> getCurrencyList() {
		return currencyRepository.findAll();
	}

	public Currency getDefaultCurrency() {
		return currencyRepository.getByCurrencyCode(DEFAULT_CURRENCY_NAME);
	}
}
