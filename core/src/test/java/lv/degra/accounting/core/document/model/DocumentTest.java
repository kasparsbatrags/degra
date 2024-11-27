package lv.degra.accounting.core.document.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.document.dataFactories.DocumentDataFactory;

class DocumentTest {

	private Validator validator;

	@BeforeEach
	void setUp() {
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		validator = factory.getValidator();
	}

	@Test
	void testValidDocument() {
		Document document = DocumentDataFactory.createValidDocument();
		var violations = validator.validate(document);
		violations.forEach(violation ->
				System.out.println("Field: " + violation.getPropertyPath() +
						", Invalid value: " + violation.getInvalidValue() +
						", Message: " + violation.getMessage()));
		assertTrue(violations.isEmpty(), "Valid document should pass validation");
	}

	@Test
	void testDocumentWithNullField() {
		Document document = DocumentDataFactory.createDocumentWithNullField();
		var violations = validator.validate(document);

		assertFalse(violations.isEmpty(), "Document with null field should fail validation");
		violations.forEach(violation ->
				System.out.println("Field: " + violation.getPropertyPath() +
						", Invalid value: " + violation.getInvalidValue() +
						", Message: " + violation.getMessage()));
	}

	@Test
	void testDocumentWithNegativeTotal() {
		Document document = DocumentDataFactory.createDocumentWithNegativeTotal();
		var violations = validator.validate(document);

		assertFalse(violations.isEmpty(), "Document with negative sum should fail validation");
	}

	@Test
	void testEqualsAndHashCode() {
		Document document1 = DocumentDataFactory.createValidDocument();
		Document document2 = DocumentDataFactory.createValidDocument();
		document2.setId(document1.getId()); // Ensure IDs match for equality

		assertEquals(document1, document2, "Objects with same data should be equal");
		assertEquals(document1.hashCode(), document2.hashCode(), "Hash codes should match");
	}

	@Test
	void testToString() {
		Document document = DocumentDataFactory.createValidDocument();
		assertEquals("DOC123", document.getDocumentNumber(), "toString should return the document number");
	}
}
