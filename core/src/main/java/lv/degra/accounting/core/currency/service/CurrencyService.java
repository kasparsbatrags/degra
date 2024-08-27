package lv.degra.accounting.core.currency.service;

import java.util.List;

import lv.degra.accounting.core.currency.model.Currency;

public interface CurrencyService {
	List<Currency> getCurrencyList();

	Currency getDefaultCurrency();
}
