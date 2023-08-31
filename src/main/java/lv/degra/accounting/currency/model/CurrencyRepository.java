package lv.degra.accounting.currency.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CurrencyRepository extends JpaRepository<Currency, Integer> {


    @Query(value = "SELECT c FROM Currency c WHERE c.currencyCode = ?1")
    Currency findByCurrencyCode(String defaultCurrencyName);

}