package lv.degra.accounting.core.bank.model;

import static lv.degra.accounting.core.bank.BankModelDataFactory.ACUSTOMER_SWED_BANK;
import static lv.degra.accounting.core.bank.BankModelDataFactory.BCUSTOMER_SEB_BANK;
import static lv.degra.accounting.core.bank.BankModelDataFactory.SWED_BANK_BIC;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.customer.CustomersData;
import lv.degra.accounting.core.customer.model.Customer;

class BankTest {

	private Bank bank;
	private Customer customer;

	@BeforeEach
	void setUp() {

		customer = CustomersData.getCustomer1();
		bank = ACUSTOMER_SWED_BANK;
	}

	@Test
	void testGettersAndSetters() {

		assertEquals(1, bank.getId());
		assertEquals(SWED_BANK_BIC, bank.getBic());
		assertEquals(customer, bank.getCustomer());


		Customer newCustomer = new Customer();
		newCustomer.setId(2);
		newCustomer.setName("New Customer");
		bank.setCustomer(newCustomer);
		assertEquals(newCustomer, bank.getCustomer());
	}

	@Test
	void testEqualsAndHashCode() {

		Bank sameBank = ACUSTOMER_SWED_BANK;
		assertEquals(bank, sameBank);
		assertEquals(bank.hashCode(), sameBank.hashCode());

		Bank differentBank = BCUSTOMER_SEB_BANK;
		assertNotEquals(bank, null);
		assertNotEquals(bank, new Object());
		assertNotEquals(bank, differentBank);
		assertNotEquals(bank.hashCode(), differentBank.hashCode());
	}

	@Test
	void testToString() {
		assertEquals(ACUSTOMER_SWED_BANK.getCustomer().getName(), bank.toString());
	}

	@Test
	void testValidationConstraints() {

		Validator validator;
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}


		bank.setBic("12345678901");
		Set<ConstraintViolation<Bank>> violations = validator.validate(bank);
		assertTrue(violations.isEmpty());


		bank.setBic("123456789012");
		violations = validator.validate(bank);
		assertFalse(violations.isEmpty());
	}
}
