package lv.degra.accounting.core.exchange.service;

import lombok.AllArgsConstructor;
import lv.degra.accounting.core.currency.model.Currency;
import lv.degra.accounting.core.currency.service.CurrencyService;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.core.exchange.model.CurrencyExchangeRateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@AllArgsConstructor
public class ExchangeServiceImpl implements ExchangeService {
    @Autowired
    private CurrencyExchangeRateRepository currencyExchangeRateRepository;

    @Autowired
    private CurrencyService currencyService;

    public CurrencyExchangeRate getActuallyExchangeRate(LocalDate exchangeRateDate, Currency currency) {
        if (currency == null) {
            currency = currencyService.getDefaultCurrency();
        }

        CurrencyExchangeRate exchangeRate = currencyExchangeRateRepository.getCurrencyRateByDateAndCurrency(exchangeRateDate, currency.getId());
        return exchangeRate != null ? exchangeRate : getDefaultCurrencyExchangeRate();
    }


    public CurrencyExchangeRate getDefaultCurrencyExchangeRate() {
        LocalDate exchangeRateDate = LocalDate.now();
        return currencyExchangeRateRepository.getCurrencyRateByDateAndCurrency(exchangeRateDate, currencyService.getDefaultCurrency().getId());
    }

}
