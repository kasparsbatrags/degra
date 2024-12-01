package lv.degra.accounting.core.account.posted.model;

import static lv.degra.accounting.core.account.chart.model.AccountCodeChartDataFactory.createCreditAccount;
import static lv.degra.accounting.core.account.chart.model.AccountCodeChartDataFactory.createDebitAccount;
import static lv.degra.accounting.core.account.posted.AccountPostedDataFactory.createValidAccountPosted;
import static lv.degra.accounting.core.document.dataFactories.DocumentDataFactory.createValidDocument;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.account.posted.AccountPostedDataFactory;
import lv.degra.accounting.core.document.model.Document;

class AccountPostedTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		validator = factory.getValidator();
	}

	@Test
	void testValidAccountPosted() {
		AccountPosted accountPosted = createValidAccountPosted();
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

	@Test
	void testEqualsSameObject() {
		AccountPosted accountPosted = createValidAccountPosted();
		assertEquals(accountPosted, accountPosted, "An object should be equal to itself");
	}

	@Test
	void testEqualsDifferentObjectWithSameValues() {
		AccountPosted accountPosted1 = createValidAccountPosted();
		AccountPosted accountPosted2 = createValidAccountPosted();

		assertEquals(accountPosted1, accountPosted2, "Objects with same values should be equal");
	}

	@Test
	void testEqualsWithNull() {
		AccountPosted accountPosted = createValidAccountPosted();
		assertNotEquals(null, accountPosted, "An object should not be equal to null");
	}

	@Test
	void testEqualsDifferentClass() {
		AccountPosted accountPosted = createValidAccountPosted();
		String differentClassObject = "Some String";
		assertNotEquals(accountPosted, differentClassObject, "An object should not be equal to an instance of a different class");
	}

	@Test
	void testEqualsDifferentId() {
		AccountPosted accountPosted1 = createValidAccountPosted();
		AccountPosted accountPosted2 = createValidAccountPosted();
		accountPosted2.setId(999);

		assertNotEquals(accountPosted1, accountPosted2, "Objects with different IDs should not be equal");
	}

	@Test
	void testEqualsDifferentDocument() {
		AccountPosted accountPosted1 = createValidAccountPosted();
		AccountPosted accountPosted2 = createValidAccountPosted();
		Document document = createValidDocument();
		document.setDocumentNumber("222");
		accountPosted2.setDocument(document);
		assertNotEquals(accountPosted1, accountPosted2, "Objects with different documents should not be equal");
	}

	@Test
	void testEqualsDifferentDebitAccount() {
		AccountPosted accountPosted1 = createValidAccountPosted();
		AccountPosted accountPosted2 = createValidAccountPosted();
		accountPosted2.setDebitAccount(createDebitAccount());

		assertNotEquals(accountPosted1, accountPosted2, "Objects with different debit accounts should not be equal");
	}

	@Test
	void testEqualsDifferentCreditAccount() {
		AccountPosted accountPosted1 = createValidAccountPosted();
		AccountPosted accountPosted2 = createValidAccountPosted();
		accountPosted2.setCreditAccount(createCreditAccount());

		assertNotEquals(accountPosted1, accountPosted2, "Objects with different credit accounts should not be equal");
	}

	@Test
	void testHashCodeConsistency() {
		AccountPosted accountPosted = createValidAccountPosted();
		int initialHashCode = accountPosted.hashCode();
		assertEquals(initialHashCode, accountPosted.hashCode(), "Hash code should remain consistent for the same object");
	}

	@Test
	void testHashCodeEqualityForEqualObjects() {
		AccountPosted accountPosted1 = createValidAccountPosted();
		AccountPosted accountPosted2 = createValidAccountPosted();

		assertEquals(accountPosted1.hashCode(), accountPosted2.hashCode(), "Equal objects should have the same hash code");
	}

	@Test
	void testHashCodeInequalityForDifferentObjects() {
		AccountPosted accountPosted1 = createValidAccountPosted();
		AccountPosted accountPosted2 = createValidAccountPosted();
		accountPosted2.setId(999);

		assertNotEquals(accountPosted1.hashCode(), accountPosted2.hashCode(), "Different objects should have different hash codes");
	}

}
