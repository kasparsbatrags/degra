package lv.degra.accounting.core.account.posted.dto;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.account.posted.AccountPostedDtoDataFactory;

class AccountPostedDtoTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		validator = factory.getValidator();
	}

	@Test
	void testValidAccountPostedDto() {
		AccountPostedDto dto = AccountPostedDtoDataFactory.createValidAccountPostedDto();
		var violations = validator.validate(dto);

		assertTrue(violations.isEmpty(), "Valid AccountPostedDto should pass validation");
	}

	@Test
	void testAccountPostedDtoWithNullDebitAccount() {
		AccountPostedDto dto = AccountPostedDtoDataFactory.createAccountPostedDtoWithNullDebitAccount();
		var violations = validator.validate(dto);

		assertFalse(violations.isEmpty(), "AccountPostedDto with null debit account should fail validation");
		violations.forEach(violation ->
				System.out.println("Field: " + violation.getPropertyPath() +
						", Invalid value: " + violation.getInvalidValue() +
						", Message: " + violation.getMessage()));
	}

	@Test
	void testAccountPostedDtoWithNegativeAmount() {
		AccountPostedDto dto = AccountPostedDtoDataFactory.createAccountPostedDtoWithNegativeAmount();
		var violations = validator.validate(dto);

		assertFalse(violations.isEmpty(), "AccountPostedDto with negative amount should fail validation");
		violations.forEach(violation ->
				System.out.println("Field: " + violation.getPropertyPath() +
						", Invalid value: " + violation.getInvalidValue() +
						", Message: " + violation.getMessage()));
	}

	@Test
	void testAccountPostedDtoWithNullDocumentDto() {
		AccountPostedDto dto = AccountPostedDtoDataFactory.createAccountPostedDtoWithNullDocumentDto();
		var violations = validator.validate(dto);

		assertFalse(violations.isEmpty(), "AccountPostedDto with null DocumentDto should fail validation");
		violations.forEach(violation ->
				System.out.println("Field: " + violation.getPropertyPath() +
						", Invalid value: " + violation.getInvalidValue() +
						", Message: " + violation.getMessage()));
	}
}
