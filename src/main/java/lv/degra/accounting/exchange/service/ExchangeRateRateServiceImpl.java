package lv.degra.accounting.exchange.service;

import lombok.AllArgsConstructor;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.currency.service.CurrencyService;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.exchange.model.CurrencyExchangeRateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@AllArgsConstructor
public class ExchangeRateRateServiceImpl implements ExchangeRateService {
    @Autowired
    private CurrencyExchangeRateRepository currencyExchangeRateRepository;

    @Autowired
    private CurrencyService currencyService;

    public CurrencyExchangeRate getActuallyExchangeRate(LocalDate exchangeRateDate, Currency currency) {
        return currencyExchangeRateRepository.getCurrencyRateByDateAndCurrency(exchangeRateDate, currency.getId());
    }

    public CurrencyExchangeRate getDefaultCurrencyExchangeRate() {
        LocalDate exchangeRateDate =  LocalDate.now();
        return currencyExchangeRateRepository.getCurrencyRateByDateAndCurrency(exchangeRateDate, currencyService.getDefaultCurrency().getId());
    }

}
