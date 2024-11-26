package lv.degra.accounting.core.account.chart.model;

import static lv.degra.accounting.core.currency.CurrencyDataFactory.getUsdCurrency;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.currency.model.Currency;

public class AccountCodeChartTest {

	private AccountCodeChart accountCodeChart;
	private Currency currency;
	private Validator validator;

	@BeforeEach
	public void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}

		currency = getUsdCurrency();
		accountCodeChart = new AccountCodeChart();
	}

	@Test
	public void testGettersAndSetters() {
		// Set values
		Integer id = 1;
		String code = "ACC-001";
		String name = "Cash Account";
		boolean isAssetsAccount = true;
		boolean useForBilance = false;
		Double amountInAccount = 1000.0;
		AccountCodeChart parentAccount = new AccountCodeChart(2, "ACC-002", "Parent Account", false, true, currency, 500.0, null);

		accountCodeChart.setId(id);
		accountCodeChart.setCode(code);
		accountCodeChart.setName(name);
		accountCodeChart.setAssetsAccount(isAssetsAccount);
		accountCodeChart.setUseForBilance(useForBilance);
		accountCodeChart.setCurrency(currency);
		accountCodeChart.setAmountInAccount(amountInAccount);
		accountCodeChart.setParentAccount(parentAccount);

		// Verify getters
		assertEquals(id, accountCodeChart.getId());
		assertEquals(code, accountCodeChart.getCode());
		assertEquals(name, accountCodeChart.getName());
		assertEquals(isAssetsAccount, accountCodeChart.isAssetsAccount());
		assertEquals(useForBilance, accountCodeChart.isUseForBilance());
		assertEquals(currency, accountCodeChart.getCurrency());
		assertEquals(amountInAccount, accountCodeChart.getAmountInAccount());
		assertEquals(parentAccount, accountCodeChart.getParentAccount());
	}

	@Test
	public void testNoArgsConstructor() {
		assertNotNull(accountCodeChart);
		assertNull(accountCodeChart.getId());
		assertNull(accountCodeChart.getCode());
		assertNull(accountCodeChart.getName());
		assertFalse(accountCodeChart.isAssetsAccount());
		assertFalse(accountCodeChart.isUseForBilance());
		assertNull(accountCodeChart.getCurrency());
		assertNull(accountCodeChart.getAmountInAccount());
		assertNull(accountCodeChart.getParentAccount());
	}

	@Test
	public void testToString() {
		String code = "EUR-001";
		accountCodeChart.setCode(code);

		assertEquals(code, accountCodeChart.toString());
	}

	@Test
	public void testCode_LengthValidation() {
		String validCode = "ACC001";
		accountCodeChart.setCode(validCode);
		assertEquals(validCode, accountCodeChart.getCode());

		String invalidCode = "TOOLONGCODE";
		accountCodeChart.setCode(invalidCode);
		Set<ConstraintViolation<AccountCodeChart>> violations = validator.validate(accountCodeChart);
		assertFalse(violations.isEmpty(), "Code should be limited to 8 characters");
	}

	@Test
	public void testName_LengthValidation() {
		String validName = "Valid Account Name";
		accountCodeChart.setName(validName);
		assertEquals(validName, accountCodeChart.getName());

		String invalidName = "This name is way too long to be valid since it exceeds eighty characters which is not allowed by the constraints.";
		accountCodeChart.setName(invalidName);
		Set<ConstraintViolation<AccountCodeChart>> violations = validator.validate(accountCodeChart);
		assertFalse(violations.isEmpty(), "Name should be limited to 80 characters");
	}

	@Test
	public void testCurrencyNotNull() {
		accountCodeChart.setCurrency(null);
		Set<ConstraintViolation<AccountCodeChart>> violations = validator.validate(accountCodeChart);
		assertFalse(violations.isEmpty(), "Currency should not be null");
	}

	@Test
	public void testInheritance_AuditInfo() {
		assertInstanceOf(AuditInfo.class, accountCodeChart);
	}
}
