package lv.degra.accounting.exchangeRate.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;

public interface CurrencyExchangeRateRepository extends JpaRepository<CurrencyExchangeRate, Long> {

    @Query(value = "SELECT cr.* FROM currency_exchange_rate cr WHERE currency_id = ?2 AND rate_date <= ?1 ORDER BY rate_date DESC LIMIT 1", nativeQuery = true)
    CurrencyExchangeRate getCurrencyRateByDateAndCurrency(LocalDate exchangeRateDate, Integer id);

}
