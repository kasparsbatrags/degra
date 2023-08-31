package lv.degra.accounting.currency.service;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import lombok.AllArgsConstructor;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.model.CurrencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CurrencyServiceImpl implements CurrencyService {

    private final static String DEFAULT_CURRENCY_NAME = "EUR";

    @Autowired
    private CurrencyRepository currencyRepository;

    public ObservableList<Currency> getCurrencyList() {
        return FXCollections.observableList(currencyRepository.findAll());
    }

    public Currency getDefaultCurrency(){
        return currencyRepository.findByCurrencyCode(DEFAULT_CURRENCY_NAME);
    }
}
