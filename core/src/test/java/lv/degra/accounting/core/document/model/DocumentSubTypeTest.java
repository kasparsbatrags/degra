package lv.degra.accounting.core.document.model;

import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.createDocumentSubTypeWithCustomDirection;
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.createDocumentSubTypeWithCustomDocumentType;
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.createDocumentSubTypeWithNullTitle;
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.createValidDocumentSubType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory;
import lv.degra.accounting.core.document.dataFactories.DocumentTypeDataFactory;

class DocumentSubTypeTest {

	@Test
	void testEquals_SameObject() {
		DocumentSubType subType = createValidDocumentSubType();
		assertEquals(subType, subType, "An object should be equal to itself");
	}

	@Test
	void testEquals_DifferentClass() {
		DocumentSubType subType = createValidDocumentSubType();
		assertNotEquals(subType, "Some String", "An object should not be equal to an instance of a different class");
	}

	@Test
	void testEquals_NullObject() {
		DocumentSubType subType = createValidDocumentSubType();
		assertNotEquals(subType, null, "An object should not be equal to null");
	}

	@Test
	void testEquals_EqualObjects() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createValidDocumentSubType();
		assertEquals(subType1, subType2, "Objects with identical values should be equal");
	}

	@Test
	void testEquals_DifferentId() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createValidDocumentSubType();
		subType2.setId(999);
		assertNotEquals(subType1, subType2, "Objects with different IDs should not be equal");
	}

	@Test
	void testEquals_DifferentTitle() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createValidDocumentSubType();
		subType2.setTitle("Different Title");
		assertNotEquals(subType1, subType2, "Objects with different titles should not be equal");
	}

	@Test
	void testEquals_NullTitle() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createDocumentSubTypeWithNullTitle();
		assertNotEquals(subType1, subType2, "Objects with one null title should not be equal");
	}

	@Test
	void testEquals_DifferentCode() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createValidDocumentSubType();
		subType2.setCode("DIFF");
		assertNotEquals(subType1, subType2, "Objects with different codes should not be equal");
	}

	@Test
	void testEquals_DifferentName() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createValidDocumentSubType();
		subType2.setName("Different Name");
		assertNotEquals(subType1, subType2, "Objects with different names should not be equal");
	}

	@Test
	void testEquals_DifferentDirection() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createDocumentSubTypeWithCustomDirection(
				DocumentDirectionDataFactory.createDocumentDirection(999, "Different Direction")
		);
		assertNotEquals(subType1, subType2, "Objects with different directions should not be equal");
	}

	@Test
	void testEquals_DifferentDocumentType() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createDocumentSubTypeWithCustomDocumentType(
				DocumentTypeDataFactory.createDocumentTypeEntry()
		);
		assertNotEquals(subType1, subType2, "Objects with different document types should not be equal");
	}

	@Test
	void testHashCode_Consistency() {
		DocumentSubType subType = createValidDocumentSubType();
		int hashCode1 = subType.hashCode();
		int hashCode2 = subType.hashCode();
		assertEquals(hashCode1, hashCode2, "HashCode should remain consistent for the same object");
	}

	@Test
	void testHashCode_Equality() {
		DocumentSubType subType1 = createValidDocumentSubType();
		DocumentSubType subType2 = createValidDocumentSubType();
		assertEquals(subType1.hashCode(), subType2.hashCode(), "Equal objects should have the same hash code");
	}
}
