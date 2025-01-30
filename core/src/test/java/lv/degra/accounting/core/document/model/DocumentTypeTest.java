package lv.degra.accounting.core.document.model;

import static lv.degra.accounting.core.document.dataFactories.DocumentTypeDataFactory.createDocumentTypeBill;
import static lv.degra.accounting.core.document.dataFactories.DocumentTypeDataFactory.createDocumentTypeWithDifferentId;
import static lv.degra.accounting.core.document.dataFactories.DocumentTypeDataFactory.createDocumentTypeWithEmptyCode;
import static lv.degra.accounting.core.document.dataFactories.DocumentTypeDataFactory.createDocumentTypeWithLongName;
import static lv.degra.accounting.core.document.dataFactories.DocumentTypeDataFactory.createDocumentTypeWithNullTitle;
import static lv.degra.accounting.core.document.dataFactories.DocumentTypeDataFactory.createValidDocumentType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

class DocumentTypeTest {

	@Test
	void testEquals_SameObject() {
		DocumentType documentType = createValidDocumentType();
		assertEquals(documentType, documentType, "An object should be equal to itself");
	}

	@Test
	void testEquals_NullObject() {
		DocumentType documentType = createValidDocumentType();
		assertNotEquals(documentType, null, "An object should not be equal to null");
	}

	@Test
	void testEquals_DifferentClass() {
		DocumentType documentType = createValidDocumentType();
		assertNotEquals(documentType, "Some String", "An object should not be equal to an instance of a different class");
	}

	@Test
	void testEquals_EqualObjects() {
		DocumentType documentType1 = createValidDocumentType();
		DocumentType documentType2 = createValidDocumentType();
		assertEquals(documentType1, documentType2, "Objects with identical values should be equal");
	}

	@Test
	void testEquals_DifferentId() {
		DocumentType documentType1 = createValidDocumentType();
		DocumentType documentType2 = createDocumentTypeWithDifferentId(999);
		assertNotEquals(documentType1, documentType2, "Objects with different IDs should not be equal");
	}

	@Test
	void testEquals_DifferentTitle() {
		DocumentType documentType1 = createValidDocumentType();
		DocumentType documentType2 = createValidDocumentType();
		documentType2.setTitle("Different Title");
		assertNotEquals(documentType1, documentType2, "Objects with different titles should not be equal");
	}

	@Test
	void testEquals_NullTitle() {
		DocumentType documentType1 = createValidDocumentType();
		DocumentType documentType2 = createDocumentTypeWithNullTitle();
		assertNotEquals(documentType1, documentType2, "Objects with one null title should not be equal");
	}

	@Test
	void testEquals_DifferentName() {
		DocumentType documentType1 = createValidDocumentType();
		DocumentType documentType2 = createValidDocumentType();
		documentType2.setName("Different Name");
		assertNotEquals(documentType1, documentType2, "Objects with different names should not be equal");
	}

	@Test
	void testEquals_LongName() {
		DocumentType documentType = createDocumentTypeWithLongName();
		assertNotEquals(documentType, createValidDocumentType(), "Objects with long name should not be valid");
	}

	@Test
	void testEquals_DifferentCode() {
		DocumentType documentType1 = createValidDocumentType();
		DocumentType documentType2 = createDocumentTypeBill();
		assertNotEquals(documentType1, documentType2, "Objects with different codes should not be equal");
	}

	@Test
	void testEquals_EmptyCode() {
		DocumentType documentType = createDocumentTypeWithEmptyCode();
		assertNotEquals(documentType, createValidDocumentType(), "Objects with empty code should not be valid");
	}

	@Test
	void testHashCode_Equality() {
		DocumentType documentType1 = createValidDocumentType();
		DocumentType documentType2 = createValidDocumentType();
		assertEquals(documentType1.hashCode(), documentType2.hashCode(), "Equal objects should have the same hash code");
	}

	@Test
	void testHashCode_Consistency() {
		DocumentType documentType = createValidDocumentType();
		int hashCode1 = documentType.hashCode();
		int hashCode2 = documentType.hashCode();
		assertEquals(hashCode1, hashCode2, "HashCode should remain consistent for the same object");
	}
}
