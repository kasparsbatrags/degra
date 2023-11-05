package lv.degra.accounting.exchange.service;

import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;

import java.time.LocalDate;

public interface ExchangeService {
    CurrencyExchangeRate getActuallyExchangeRate(LocalDate exchangeRateDate, Currency currency);

    CurrencyExchangeRate getDefaultCurrencyExchangeRate();
}
