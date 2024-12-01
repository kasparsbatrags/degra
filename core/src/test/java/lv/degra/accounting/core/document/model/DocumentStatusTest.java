package lv.degra.accounting.core.document.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

public class DocumentStatusTest {

	private DocumentStatus documentStatus;

	@BeforeEach
	public void setUp() {
		documentStatus = new DocumentStatus();
		documentStatus.setId(1);
		documentStatus.setCode("APPROVED");
		documentStatus.setName("Approved");
	}

	@Test
	public void testGettersAndSetters() {
		// Verify initial values
		assertEquals(1, documentStatus.getId());
		assertEquals("APPROVED", documentStatus.getCode());
		assertEquals("Approved", documentStatus.getName());

		// Update values
		documentStatus.setId(2);
		documentStatus.setCode("REJECTED");
		documentStatus.setName("Rejected");

		// Verify updated values
		assertEquals(2, documentStatus.getId());
		assertEquals("REJECTED", documentStatus.getCode());
		assertEquals("Rejected", documentStatus.getName());
	}

	@Test
	public void testToString() {
		assertEquals("Approved", documentStatus.toString());
	}

	@Test
	public void testEquals_SameObject() {
		assertEquals(documentStatus, documentStatus);
	}

	@Test
	public void testEquals_DifferentObjectSameValues() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(1);
		anotherDocumentStatus.setCode("APPROVED");
		anotherDocumentStatus.setName("Approved");
		assertEquals(documentStatus, anotherDocumentStatus);
	}

	@Test
	public void testEquals_DifferentObjectDifferentValues() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(2);
		anotherDocumentStatus.setCode("REJECTED");
		anotherDocumentStatus.setName("Rejected");
		assertNotEquals(documentStatus, anotherDocumentStatus);
	}

	@Test
	public void testEquals_NullObject() {
		assertNotEquals(null, documentStatus);
	}

	@Test
	public void testEquals_DifferentClass() {
		assertNotEquals("Some String", documentStatus);
	}

	@Test
	public void testHashCode() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(1);
		anotherDocumentStatus.setCode("APPROVED");
		anotherDocumentStatus.setName("Approved");
		assertEquals(documentStatus.hashCode(), anotherDocumentStatus.hashCode());
	}

	@Test
	public void testValidationConstraints() {
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		Validator validator = factory.getValidator();

		DocumentStatus invalidDocumentStatus = new DocumentStatus();
		invalidDocumentStatus.setCode(null);
		invalidDocumentStatus.setName(null);

		Set<ConstraintViolation<DocumentStatus>> violations = validator.validate(invalidDocumentStatus);
		assertFalse(violations.isEmpty(), "Expected validation violations for null values");
	}

	@Test
	public void testEquals_DifferentId() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(2); // Different ID
		anotherDocumentStatus.setCode("APPROVED");
		anotherDocumentStatus.setName("Approved");
		assertNotEquals(documentStatus, anotherDocumentStatus, "Objects with different IDs should not be equal");
	}

	@Test
	public void testEquals_DifferentCode() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(1);
		anotherDocumentStatus.setCode("REJECTED"); // Different Code
		anotherDocumentStatus.setName("Approved");
		assertNotEquals(documentStatus, anotherDocumentStatus, "Objects with different codes should not be equal");
	}

	@Test
	public void testEquals_DifferentName() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(1);
		anotherDocumentStatus.setCode("APPROVED");
		anotherDocumentStatus.setName("Rejected"); // Different Name
		assertNotEquals(documentStatus, anotherDocumentStatus, "Objects with different names should not be equal");
	}

	@Test
	public void testEquals_NullId() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(null); // Null ID
		anotherDocumentStatus.setCode("APPROVED");
		anotherDocumentStatus.setName("Approved");
		assertNotEquals(documentStatus, anotherDocumentStatus, "Objects with one null ID should not be equal");
	}

	@Test
	public void testEquals_NullCode() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(1);
		anotherDocumentStatus.setCode(null); // Null Code
		anotherDocumentStatus.setName("Approved");
		assertNotEquals(documentStatus, anotherDocumentStatus, "Objects with one null code should not be equal");
	}

	@Test
	public void testEquals_NullName() {
		DocumentStatus anotherDocumentStatus = new DocumentStatus();
		anotherDocumentStatus.setId(1);
		anotherDocumentStatus.setCode("APPROVED");
		anotherDocumentStatus.setName(null); // Null Name
		assertNotEquals(documentStatus, anotherDocumentStatus, "Objects with one null name should not be equal");
	}

	@Test
	public void testEquals_AllFieldsNull() {
		DocumentStatus documentStatus1 = new DocumentStatus();
		DocumentStatus documentStatus2 = new DocumentStatus();
		assertEquals(documentStatus1, documentStatus2, "Objects with all fields null should be equal");
	}

	@Test
	public void testEquals_MixedNullFields() {
		DocumentStatus documentStatus1 = new DocumentStatus();
		documentStatus1.setId(1);
		documentStatus1.setCode(null);
		documentStatus1.setName(null);

		DocumentStatus documentStatus2 = new DocumentStatus();
		documentStatus2.setId(1);
		documentStatus2.setCode(null);
		documentStatus2.setName("Approved");

		assertNotEquals(documentStatus1, documentStatus2, "Objects with mixed null fields should not be equal");
	}

	@Test
	public void testNotEqualsWithNullAndAnotherTypeObject() {
		DocumentStatus documentStatus1 = new DocumentStatus();
		DocumentStatus documentStatus2 = new DocumentStatus();
		assertNotEquals(documentStatus1, null, "Objects with null should be not equal");
		assertNotEquals(documentStatus1, new Object(), "Objects with different object type should be not equal");
	}

}
