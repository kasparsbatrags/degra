package lv.degra.accounting.core.currency.model;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CurrencyRepository extends JpaRepository<Currency, Integer> {

    Currency getByCode(String currencyName);

}