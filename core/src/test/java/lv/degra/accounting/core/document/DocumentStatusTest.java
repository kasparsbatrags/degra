package lv.degra.accounting.core.document;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.document.dataFactories.DocumentStatusDataFactory;
import lv.degra.accounting.core.document.model.DocumentStatus;

class DocumentStatusTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		validator = factory.getValidator();
	}

	@Test
	void testValidNewStatus() {
		DocumentStatus status = DocumentStatusDataFactory.createNewStatus();
		var violations = validator.validate(status);
		assertTrue(violations.isEmpty(), "New status should pass validation");
	}

	@Test
	void testValidApprovedStatus() {
		DocumentStatus status = DocumentStatusDataFactory.createApprovedStatus();
		var violations = validator.validate(status);
		assertTrue(violations.isEmpty(), "Approved status should pass validation");
	}

	@Test
	void testInvalidCode() {
		DocumentStatus status = DocumentStatusDataFactory.createStatusWithInvalidCode();
		var violations = validator.validate(status);
		assertFalse(violations.isEmpty(), "Status with invalid code should fail validation");
		assertEquals("size must be between 0 and 10", violations.iterator().next().getMessage());
	}

	@Test
	void testNullName() {
		DocumentStatus status = DocumentStatusDataFactory.createStatusWithNullName();
		var violations = validator.validate(status);
		assertFalse(violations.isEmpty(), "Status with null name should fail validation");
		assertEquals("must not be null", violations.iterator().next().getMessage());
	}


	@Test
	void testNullCode() {
		DocumentStatus status = DocumentStatusDataFactory.createStatusWithNullName();
		var violations = validator.validate(status);
		assertFalse(violations.isEmpty(), "Status with null code should fail validation");
		assertEquals("must not be null", violations.iterator().next().getMessage());
	}

	@Test
	void testToString() {
		DocumentStatus status = DocumentStatusDataFactory.createNewStatus();
		assertEquals("Jauns", status.toString(), "toString should return the name");
	}

	@Test
	void testEqualsAndHashCode() {
		DocumentStatus status1 = DocumentStatusDataFactory.createNewStatus();
		DocumentStatus status2 = DocumentStatusDataFactory.createNewStatus();

		assertEquals(status1, status2, "Objects with same data should be equal");
		assertEquals(status1.hashCode(), status2.hashCode(), "Hash codes should match");
	}

	@Test
	void testNotEquals() {
		DocumentStatus status1 = DocumentStatusDataFactory.createNewStatus();
		DocumentStatus status2 = DocumentStatusDataFactory.createApprovedStatus();

		assertNotEquals(status1, status2, "Objects with different data should not be equal");
	}
}
