package lv.degra.accounting.exchangeRate.service;

import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.exchangeRate.model.CurrencyExchangeRate;

import java.time.LocalDate;

public interface ExchangeRateService {
    CurrencyExchangeRate getActuallyExchangeRate(LocalDate exchangeRateDate, Currency currency);

    CurrencyExchangeRate getDefaultCurrencyExchangeRate();
}
