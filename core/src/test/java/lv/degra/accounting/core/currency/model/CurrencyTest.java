package lv.degra.accounting.core.currency.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.auditor.model.AuditInfo;

public class CurrencyTest {

	private Currency currency;

	@BeforeEach
	public void setUp() {
		currency = new Currency();
	}

	@Test
	public void testGettersAndSetters() {
		// Set values
		Integer id = 1;
		String currencyCode = "USD";
		String currencyName = "United States Dollar";
		String subunitName = "Cent";

		currency.setId(id);
		currency.setCurrencyCode(currencyCode);
		currency.setCurrencyName(currencyName);
		currency.setSubunitName(subunitName);

		// Verify getters
		assertEquals(id, currency.getId());
		assertEquals(currencyCode, currency.getCurrencyCode());
		assertEquals(currencyName, currency.getCurrencyName());
		assertEquals(subunitName, currency.getSubunitName());
	}

	@Test
	public void testNoArgsConstructor() {
		assertNotNull(currency);
		assertNull(currency.getId());
		assertNull(currency.getCurrencyCode());
		assertNull(currency.getCurrencyName());
		assertNull(currency.getSubunitName());
	}

	@Test
	public void testToString() {
		String currencyCode = "EUR";
		currency.setCurrencyCode(currencyCode);

		assertEquals(currencyCode, currency.toString());
	}

	@Test
	public void testSetCurrencyCode_LengthValidation() {
		String validCurrencyCode = "USD";
		currency.setCurrencyCode(validCurrencyCode);
		assertEquals(validCurrencyCode, currency.getCurrencyCode());

		String invalidCurrencyCode = "USDA";
		currency.setCurrencyCode(invalidCurrencyCode);
		assertNotEquals(invalidCurrencyCode, currency.getCurrencyCode(), "Currency code should be limited to 3 characters");
	}

	@Test
	public void testInheritance_AuditInfo() {
		assertInstanceOf(AuditInfo.class, currency);
	}
}
