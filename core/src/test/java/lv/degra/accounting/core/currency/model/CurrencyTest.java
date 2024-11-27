package lv.degra.accounting.core.currency.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.auditor.model.AuditInfo;

public class CurrencyTest {

	private Currency currency;
	private Validator validator;

	@BeforeEach
	public void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}
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
		currency.setCode(currencyCode);
		currency.setCurrencyName(currencyName);
		currency.setSubunitName(subunitName);

		// Verify getters
		assertEquals(id, currency.getId());
		assertEquals(currencyCode, currency.getCode());
		assertEquals(currencyName, currency.getCurrencyName());
		assertEquals(subunitName, currency.getSubunitName());
	}

	@Test
	public void testNoArgsConstructor() {
		assertNotNull(currency);
		assertNull(currency.getId());
		assertNull(currency.getCode());
		assertNull(currency.getCurrencyName());
		assertNull(currency.getSubunitName());
	}

	@Test
	public void testToString() {
		String currencyCode = "EUR";
		currency.setCode(currencyCode);

		assertEquals(currencyCode, currency.toString());
	}

	@Test
	public void testSetCurrencyCode_LengthValidation() {
		// Valid currency code
		String validCurrencyCode = "USD";
		currency.setCode(validCurrencyCode);
		Set<ConstraintViolation<Currency>> violations = validator.validate(currency);
		assertTrue(violations.isEmpty(), "Valid currency code should pass validation");

		// Invalid currency code
		String invalidCurrencyCode = "USDA"; // Pārsniedz garumu 3
		currency.setCode(invalidCurrencyCode);
		violations = validator.validate(currency);
		assertFalse(violations.isEmpty(), "Currency code should be limited to 3 characters");
	}

	@Test
	public void testInheritance_AuditInfo() {
		assertInstanceOf(AuditInfo.class, currency);
	}
}
