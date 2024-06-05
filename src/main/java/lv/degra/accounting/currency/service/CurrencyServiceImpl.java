package lv.degra.accounting.currency.service;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.model.CurrencyRepository;

@Service
@AllArgsConstructor
@NoArgsConstructor
public class CurrencyServiceImpl implements CurrencyService {

	private static final String DEFAULT_CURRENCY_NAME = "EUR";

	@Autowired
	private CurrencyRepository currencyRepository;

	public List<Currency> getCurrencyList() {
		return currencyRepository.findAll();
	}

	public Currency getDefaultCurrency() {
		return currencyRepository.findByCurrencyCode(DEFAULT_CURRENCY_NAME);
	}
}
