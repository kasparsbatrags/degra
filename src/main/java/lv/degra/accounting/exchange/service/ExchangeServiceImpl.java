package lv.degra.accounting.exchange.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyServiceImpl;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.exchange.model.CurrencyExchangeRateRepository;

@Service
@AllArgsConstructor
public class ExchangeServiceImpl implements ExchangeService {
	@Autowired
	private CurrencyExchangeRateRepository currencyExchangeRateRepository;

	@Autowired
	private CurrencyServiceImpl currencyServiceImpl;

	public CurrencyExchangeRate getActuallyExchangeRate(LocalDate exchangeRateDate, Currency currency) {
		return currencyExchangeRateRepository.getCurrencyRateByDateAndCurrency(exchangeRateDate, currency.getId());
	}

	public CurrencyExchangeRate getDefaultCurrencyExchangeRate() {
		LocalDate exchangeRateDate = LocalDate.now();
		return currencyExchangeRateRepository.getCurrencyRateByDateAndCurrency(exchangeRateDate,
				currencyServiceImpl.getDefaultCurrency().getId());
	}

}
