package lv.degra.accounting.core.document.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

import lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory;

class DocumentDirectionTest {

	@Test
	void testEqualsSameObject() {
		DocumentDirection direction = createValidDocumentDirection();
		assertEquals(direction, direction, "An object should be equal to itself");
	}

	@Test
	void testEqualsWithNull() {
		DocumentDirection direction = createValidDocumentDirection();
		assertNotEquals(null, direction, "An object should not be equal to null");
	}

	@Test
	void testEqualsWithDifferentClass() {
		DocumentDirection direction = createValidDocumentDirection();
		String otherObject = "Some String";
		assertNotEquals(direction, otherObject, "An object should not be equal to an instance of a different class");
	}

	@Test
	void testEqualsWithEqualObjects() {
		DocumentDirection direction1 = createValidDocumentDirection();
		DocumentDirection direction2 = createValidDocumentDirection();
		assertEquals(direction1, direction2, "Objects with identical values should be equal");
	}

	@Test
	void testEqualsWithDifferentId() {
		DocumentDirection direction1 = createValidDocumentDirection();
		DocumentDirection direction2 = createValidDocumentDirection();
		direction2.setId(999);
		assertNotEquals(direction1, direction2, "Objects with different IDs should not be equal");
	}

	@Test
	void testEqualsWithDifferentName() {
		DocumentDirection direction1 = createValidDocumentDirection();
		DocumentDirection direction2 = createValidDocumentDirection();
		direction2.setName("Different Name");
		assertNotEquals(direction1, direction2, "Objects with different names should not be equal");
	}

	@Test
	void testHashCodeEqualityForEqualObjects() {
		DocumentDirection direction1 = createValidDocumentDirection();
		DocumentDirection direction2 = createValidDocumentDirection();
		assertEquals(direction1.hashCode(), direction2.hashCode(), "Equal objects should have the same hash code");
	}

	@Test
	void testHashCodeInequalityForDifferentObjects() {
		DocumentDirection direction1 = createValidDocumentDirection();
		DocumentDirection direction2 = createValidDocumentDirection();
		direction2.setId(999);
		assertNotEquals(direction1.hashCode(), direction2.hashCode(), "Different objects should have different hash codes");
	}

	@Test
	void testToString() {
		DocumentDirection direction = createValidDocumentDirection();
		assertEquals("Ienākošais", direction.toString(), "toString should return the name of the direction");
	}

	private DocumentDirection createValidDocumentDirection() {
		return DocumentDirectionDataFactory.createDocumentDirection(DocumentDirectionDataFactory.INBOUND_ID,
				DocumentDirectionDataFactory.INBOUND_NAME);
	}
}
