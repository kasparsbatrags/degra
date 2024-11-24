package lv.degra.accounting.desktop.data;

import java.time.Instant;

import lv.degra.accounting.core.currency.model.Currency;

public class CurrencyDataFactory {

    public static Currency createCurrency(Integer id, String currencyCode, String currencyName, String subunitName, Instant createdAt, Instant lastModifiedAt) {
        Currency currency = new Currency();
        currency.setId(id);
        currency.setCurrencyCode(currencyCode);
        currency.setCurrencyName(currencyName);
        currency.setSubunitName(subunitName);
        return currency;
    }

    public static Currency getDefaultCurrency() {
        return createCurrency(1, "USD", "United States Dollar", "Cent", Instant.now(), Instant.now());
    }

    public static Currency getEurCurrency() {
        return createCurrency(2, "EUR", "Euro", "Cent", Instant.now(), Instant.now());
    }

    public static Currency getGbpCurrency() {
        return createCurrency(3, "GBP", "British Pound", "Penny", Instant.now(), Instant.now());
    }
}
