package lv.degra.accounting.core.exchange.model;

import static lv.degra.accounting.core.currency.CurrencyDataFactory.getDefaultCurrency;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.currency.model.Currency;

public class CurrencyExchangeRateTest {

	private CurrencyExchangeRate currencyExchangeRate;
	private Currency currency;

	@BeforeEach
	void setUp() {
		currencyExchangeRate = new CurrencyExchangeRate();
		currency = getDefaultCurrency();
	}

	@Test
	void testGetterAndSetter() {
		currencyExchangeRate.setId(1);
		currencyExchangeRate.setCurrency(currency);
		currencyExchangeRate.setRateDate(LocalDate.of(2024, 1, 1));
		currencyExchangeRate.setRate(1.5);

		assertEquals(1, currencyExchangeRate.getId());
		assertEquals(currency, currencyExchangeRate.getCurrency());
		assertEquals(LocalDate.of(2024, 1, 1), currencyExchangeRate.getRateDate());
		assertEquals(1.5, currencyExchangeRate.getRate());
	}

	@Test
	void testEqualsAndHashCode() {
		CurrencyExchangeRate rate1 = new CurrencyExchangeRate();
		rate1.setId(1);
		rate1.setCurrency(currency);
		rate1.setRateDate(LocalDate.of(2024, 1, 1));
		rate1.setRate(1.5);

		CurrencyExchangeRate rate2 = new CurrencyExchangeRate();
		rate2.setId(1);
		rate2.setCurrency(currency);
		rate2.setRateDate(LocalDate.of(2024, 1, 1));
		rate2.setRate(1.5);

		CurrencyExchangeRate rate3 = new CurrencyExchangeRate();
		rate3.setId(2);
		rate3.setCurrency(currency);
		rate3.setRateDate(LocalDate.of(2024, 1, 1));
		rate3.setRate(2.0);

		assertEquals(rate1, rate2);
		assertEquals(rate1.hashCode(), rate2.hashCode());
		assertNotEquals(rate1, rate3);
		assertNotEquals(rate1.hashCode(), rate3.hashCode());
		assertNotEquals(rate1, null);
		assertNotEquals(rate1, new Object());
	}

	@Test
	void testToString() {
		currencyExchangeRate.setId(1);
		currencyExchangeRate.setCurrency(currency);
		currencyExchangeRate.setRateDate(LocalDate.of(2024, 1, 1));
		currencyExchangeRate.setRate(1.5);

		String expected = "CurrencyExchangeRate{id=1, currency=USD, rateDate=2024-01-01, rate=1.5}";
		assertTrue(currencyExchangeRate.toString().contains(expected));
	}

//	@Test
//	void testValidationAnnotations() {
//		assertNotNull(CurrencyExchangeRate.class.getAnnotation(javax.persistence.Entity.class));
//		assertNotNull(CurrencyExchangeRate.class.getAnnotation(org.hibernate.envers.Audited.class));
//		assertNotNull(CurrencyExchangeRate.class.getAnnotation(jakarta.persistence.Table.class));
//	}
}
