package lv.degra.accounting.core.exchange.service;

import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRate;

import java.time.LocalDate;

public interface ExchangeService {
    CurrencyExchangeRate getActuallyExchangeRate(LocalDate exchangeRateDate, Currency currency);

    CurrencyExchangeRate getDefaultCurrencyExchangeRate();
}
