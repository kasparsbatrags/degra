package lv.degra.accounting.core.customer_account.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.bank.model.Bank;
import lv.degra.accounting.core.customer.model.Customer;

class CustomerAccountTest {

	private Validator validator;
	private CustomerAccount customerAccount;

	@BeforeEach
	void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}

		customerAccount = new CustomerAccount();
		customerAccount.setId(1);
		customerAccount.setAccount("LV1234567890123456789");

		Bank mockBank = Mockito.mock(Bank.class);
		Customer mockCustomer = Mockito.mock(Customer.class);

		customerAccount.setBank(mockBank);
		customerAccount.setCustomer(mockCustomer);
	}

	@Test
	void testValidCustomerAccount() {
		var violations = validator.validate(customerAccount);
		assertTrue(violations.isEmpty(), "CustomerAccount should be valid");
	}

	@Test
	void testNullBank() {
		customerAccount.setBank(null);
		var violations = validator.validate(customerAccount);
		assertFalse(violations.isEmpty(), "Bank cannot be null");
		assertEquals("must not be null", violations.iterator().next().getMessage());
	}

	@Test
	void testNullCustomer() {
		customerAccount.setCustomer(null);
		var violations = validator.validate(customerAccount);
		assertFalse(violations.isEmpty(), "Customer cannot be null");
		assertEquals("must not be null", violations.iterator().next().getMessage());
	}

	@Test
	void testAccountMaxLength() {
		customerAccount.setAccount("LV123456789012345678901"); // 22 characters
		var violations = validator.validate(customerAccount);
		assertFalse(violations.isEmpty(), "Account exceeds maximum length of 21 characters");
	}

	@Test
	void testNullAccount() {
		customerAccount.setAccount(null);
		var violations = validator.validate(customerAccount);
		assertFalse(violations.isEmpty(), "Account cannot be null");
		assertEquals("must not be null", violations.iterator().next().getMessage());
	}

	@Test
	void testToString() {
		assertEquals("LV1234567890123456789", customerAccount.toString());
	}

}
