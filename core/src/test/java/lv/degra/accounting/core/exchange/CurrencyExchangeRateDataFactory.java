package lv.degra.accounting.core.exchange;

import java.time.LocalDate;

import lv.degra.accounting.core.currency.CurrencyDataFactory;
import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRate;

public class CurrencyExchangeRateDataFactory {

    public static CurrencyExchangeRate createCurrencyExchangeRate(Integer id, Currency currency, LocalDate rateDate, Double rate) {
        CurrencyExchangeRate exchangeRate = new CurrencyExchangeRate();
        exchangeRate.setId(id);
        exchangeRate.setCurrency(currency);
        exchangeRate.setRateDate(rateDate);
        exchangeRate.setRate(rate);
        return exchangeRate;
    }

    public static CurrencyExchangeRate getDefaultExchangeRate() {
        return createCurrencyExchangeRate(1, CurrencyDataFactory.getDefaultCurrency(), LocalDate.now(), 1.0);
    }

    public static CurrencyExchangeRate getEurExchangeRate() {
        return createCurrencyExchangeRate(2, CurrencyDataFactory.getEurCurrency(), LocalDate.now(), 0.85);
    }

    public static CurrencyExchangeRate getGbpExchangeRate() {
        return createCurrencyExchangeRate(3, CurrencyDataFactory.getGbpCurrency(), LocalDate.now(), 0.75);
    }
}
