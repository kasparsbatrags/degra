package lv.degra.accounting.core.account.posted.model;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.account.posted.AccountPostedDataFactory;

class AccountPostedTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		validator = factory.getValidator();
	}

	@Test
	void testValidAccountPosted() {
		AccountPosted accountPosted = AccountPostedDataFactory.createValidAccountPosted();
		var violations = validator.validate(accountPosted);

		assertTrue(violations.isEmpty(), "Valid AccountPosted should pass validation");
	}

	@Test
	void testAccountPostedWithNullDocument() {
		AccountPosted accountPosted = AccountPostedDataFactory.createAccountPostedWithNullDocument();
		var violations = validator.validate(accountPosted);

		assertFalse(violations.isEmpty(), "AccountPosted with null document should fail validation");
		violations.forEach(violation ->
				System.out.println("Field: " + violation.getPropertyPath() +
						", Invalid value: " + violation.getInvalidValue() +
						", Message: " + violation.getMessage()));
	}

	@Test
	void testAccountPostedWithNegativeAmount() {
		AccountPosted accountPosted = AccountPostedDataFactory.createAccountPostedWithNegativeAmount();
		var violations = validator.validate(accountPosted);

		assertFalse(violations.isEmpty(), "AccountPosted with negative amount should fail validation");
	}

	@Test
	void testAccountPostedWithNullDebitAccount() {
		AccountPosted accountPosted = AccountPostedDataFactory.createAccountPostedWithNullDebitAccount();
		var violations = validator.validate(accountPosted);

		assertFalse(violations.isEmpty(), "AccountPosted with null debit account should fail validation");
	}

	@Test
	void testAccountPostedWithNullCreditAccount() {
		AccountPosted accountPosted = AccountPostedDataFactory.createAccountPostedWithNullCreditAccount();
		var violations = validator.validate(accountPosted);

		assertFalse(violations.isEmpty(), "AccountPosted with null credit account should fail validation");
	}
}
