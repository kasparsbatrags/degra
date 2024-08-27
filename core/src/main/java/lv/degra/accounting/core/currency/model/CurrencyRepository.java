package lv.degra.accounting.core.currency.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CurrencyRepository extends JpaRepository<Currency, Integer> {


    @Query(value = "SELECT c FROM Currency c WHERE c.currencyCode = :currencyName")
    Currency findByCurrencyCode(@Param("currencyName") String currencyName);

}