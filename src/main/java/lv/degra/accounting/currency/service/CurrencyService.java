package lv.degra.accounting.currency.service;

import java.util.List;

import lv.degra.accounting.currency.model.Currency;

public interface CurrencyService {
	List<Currency> getCurrencyList();

	Currency getDefaultCurrency();
}
