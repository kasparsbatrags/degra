package lv.degra.accounting.currency.service;

import javafx.collections.ObservableList;
import lv.degra.accounting.currency.model.Currency;

public interface CurrencyService {
    ObservableList<Currency> getCurrencyList();
    Currency getDefaultCurrency();
}
