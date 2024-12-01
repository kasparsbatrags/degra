package lv.degra.accounting.core.document.model;

import static lv.degra.accounting.core.document.dataFactories.DeclarationSectionDataFactory.createValidSection2;
import static lv.degra.accounting.core.document.dataFactories.DocumentTransactionTypeDataFactory.createTransactionTypeWithLongCode;
import static lv.degra.accounting.core.document.dataFactories.DocumentTransactionTypeDataFactory.createTransactionTypeWithNullDeclarationSection;
import static lv.degra.accounting.core.document.dataFactories.DocumentTransactionTypeDataFactory.createTransactionTypeWithNullName;
import static lv.degra.accounting.core.document.dataFactories.DocumentTransactionTypeDataFactory.createValidTransactionType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

class DocumentTransactionTypeTest {

	@Test
	void testEquals_SameObject() {
		DocumentTransactionType transactionType = createValidTransactionType();
		assertEquals(transactionType, transactionType, "An object should be equal to itself");
	}

	@Test
	void testEquals_DifferentClass() {
		DocumentTransactionType transactionType = createValidTransactionType();
		assertNotEquals(transactionType, "Some String", "An object should not be equal to an instance of a different class");
	}

	@Test
	void testEquals_NullObject() {
		DocumentTransactionType transactionType = createValidTransactionType();
		assertNotEquals(transactionType, null, "An object should not be equal to null");
	}

	@Test
	void testEquals_EqualObjects() {
		DocumentTransactionType transactionType1 = createValidTransactionType();
		DocumentTransactionType transactionType2 = createValidTransactionType();
		assertEquals(transactionType1, transactionType2, "Objects with identical values should be equal");
	}

	@Test
	void testEquals_DifferentId() {
		DocumentTransactionType transactionType1 = createValidTransactionType();
		DocumentTransactionType transactionType2 = createValidTransactionType();
		transactionType2.setId(999);
		assertNotEquals(transactionType1, transactionType2, "Objects with different IDs should not be equal");
	}

	@Test
	void testEquals_DifferentCode() {
		DocumentTransactionType transactionType1 = createValidTransactionType();
		DocumentTransactionType transactionType2 = createTransactionTypeWithLongCode();
		assertNotEquals(transactionType1, transactionType2, "Objects with different codes should not be equal");
	}

	@Test
	void testEquals_DifferentName() {
		DocumentTransactionType transactionType1 = createValidTransactionType();
		DocumentTransactionType transactionType2 = createValidTransactionType();
		transactionType2.setName("Different Name");
		assertNotEquals(transactionType1, transactionType2, "Objects with different names should not be equal");
	}

	@Test
	void testEquals_NullName() {
		DocumentTransactionType transactionType1 = createValidTransactionType();
		DocumentTransactionType transactionType2 = createTransactionTypeWithNullName();
		assertNotEquals(transactionType1, transactionType2, "Objects with one null name should not be equal");
	}

	@Test
	void testEquals_DifferentDeclarationSection() {
		DocumentTransactionType transactionType1 = createValidTransactionType();
		DocumentTransactionType transactionType2 = createTransactionTypeWithNullDeclarationSection();
		transactionType2.setDeclarationSection(createValidSection2());
		assertNotEquals(transactionType1, transactionType2, "Objects with different declaration sections should not be equal");
	}

	@Test
	void testEquals_NullDeclarationSection() {
		DocumentTransactionType transactionType1 = createValidTransactionType();
		DocumentTransactionType transactionType2 = createTransactionTypeWithNullDeclarationSection();
		assertNotEquals(transactionType1, transactionType2, "Objects with one null declaration section should not be equal");
	}

	@Test
	void testHashCode_Consistency() {
		DocumentTransactionType transactionType = createValidTransactionType();
		int hashCode1 = transactionType.hashCode();
		int hashCode2 = transactionType.hashCode();
		assertEquals(hashCode1, hashCode2, "HashCode should remain consistent for the same object");
	}

	@Test
	void testHashCode_Equality() {
		DocumentTransactionType transactionType1 = createValidTransactionType();
		DocumentTransactionType transactionType2 = createValidTransactionType();
		assertEquals(transactionType1.hashCode(), transactionType2.hashCode(), "Equal objects should have the same hash code");
	}
}
