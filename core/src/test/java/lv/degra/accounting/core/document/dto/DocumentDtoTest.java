package lv.degra.accounting.core.document.dto;

import static lv.degra.accounting.core.account.posted.AccountPostedDtoDataFactory.createValidAccountPostedDto;
import static lv.degra.accounting.core.currency.CurrencyDataFactory.getDefaultCurrency;
import static lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory.createDocumentDirection;
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.getGbsDocumentSubType;
import static lv.degra.accounting.core.document.dataFactories.DocumentTransactionTypeDataFactory.createValidTransactionType;
import static lv.degra.accounting.core.document.dto.DocumentDtoDataFactory.createValidDocumentDto;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collections;

import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class DocumentDtoTest {

	private Validator validator;
	private DocumentDto documentDto;

	@BeforeEach
	void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}
		documentDto = createValidDocumentDto();
	}

	@Test
	void testValidDocumentDto() {
		var violations = validator.validate(documentDto);
		assertTrue(violations.isEmpty(), "DocumentDto should be valid");
	}

	@Test
	void testNullFields() {
		documentDto.setDocumentStatus(null);
		var violations = validator.validate(documentDto);
		assertFalse(violations.isEmpty(), "DocumentStatus cannot be null");
	}

	@Test
	void testStringSizeValidation() {
		documentDto.setDocumentSeries(StringUtils.repeat("A", 21)); // Exceeds max size
		var violations = validator.validate(documentDto);
		assertFalse(violations.isEmpty(), "DocumentSeries exceeds maximum size");
	}

	@Test
	void testIsBillReturnsTrue() {
		assertTrue(documentDto.isBill(), "isBill should return true for subtype BILL");
	}

	@Test
	void testIsBillReturnsFalse() {
		documentDto.setDocumentSubType(getGbsDocumentSubType());
		assertFalse(documentDto.isBill(), "isBill should return false for non-BILL subtype");
	}

	@Test
	void testEqualsAndHashCode() {
		DocumentDto other = new DocumentDto(documentDto);
		assertEquals(documentDto, other, "Objects should be equal");
		assertEquals(documentDto.hashCode(), other.hashCode(), "Hash codes should match");
	}

	@Test
	void testNotEquals() {
		DocumentDto other = new DocumentDto(documentDto);
		other.setId(2);
		assertNotEquals(documentDto, other, "Objects should not be equal");
	}

	@Test
	void testUpdateMethod() {
		DocumentDto updated = DocumentDto.builder().documentNumber("456").sumTotal(150.0).currency(getDefaultCurrency()).build();
		documentDto.update(updated);

		assertEquals("456", documentDto.getDocumentNumber(), "DocumentNumber should be updated");
		assertEquals(150.0, documentDto.getSumTotal(), "SumTotal should be updated");
		assertEquals("USD", documentDto.getCurrency().getCode(), "Currency should be updated");
	}

	@Test
	void testUpdateMethodWithNull() {
		documentDto.update(null);

		assertEquals("DOC123", documentDto.getDocumentNumber(), "Original values should remain unchanged");
	}

	@Test
	void testEqualsWithDifferentClass() {
		assertNotEquals("Some String", documentDto, "Should not be equal to an object of different class");
	}

	@Test
	void testHashCodeWithNullValues() {
		DocumentDto emptyDocumentDto = new DocumentDto();
		assertNotEquals(documentDto.hashCode(), emptyDocumentDto.hashCode(), "Hash codes should not match for different content");
	}

	@Test
	void testUpdateMethodWithPartialValues() {
		DocumentDto partialUpdate = createValidDocumentDto();
		partialUpdate.setDocumentNumber("999");
		documentDto.update(partialUpdate);

		assertEquals("999", documentDto.getDocumentNumber(), "DocumentNumber should be updated");
		assertNotNull(documentDto.getDocumentSeries(), "DocumentSeries should remain unchanged");
	}

	@Test
	void testIsBillWithNullSubType() {
		documentDto.setDocumentSubType(null);
		assertFalse(documentDto.isBill(), "isBill should return false for null subtype");
	}

	@Test
	void testEqualsWithSelf() {
		assertEquals(documentDto, documentDto, "Should be equal to itself");
	}

	@Test
	void testEqualsMethod() {
		// Identiski objekti (vienāds saturs)
		DocumentDto identicalDocument = new DocumentDto(documentDto);
		assertEquals(documentDto, identicalDocument, "Objects with identical fields should be equal");

		// Salīdzinājums ar pašu objektu
		assertEquals(documentDto, documentDto, "Object should be equal to itself");

		// Salīdzinājums ar null
		assertNotEquals(null, documentDto, "Object should not be equal to null");

		// Salīdzinājums ar citu klasi
		assertNotEquals("String", documentDto, "Object should not be equal to an instance of a different class");

		// Objekti ar dažādiem ID
		DocumentDto differentIdDocument = new DocumentDto(documentDto);
		differentIdDocument.setId(999);
		assertNotEquals(documentDto, differentIdDocument, "Objects with different IDs should not be equal");

		// Objekti ar dažādiem `documentNumber`
		DocumentDto differentDocumentNumber = new DocumentDto(documentDto);
		differentDocumentNumber.setDocumentNumber("DifferentNumber");
		assertNotEquals(documentDto, differentDocumentNumber, "Objects with different documentNumber should not be equal");

		// Objekti ar dažādiem `documentDirection`
		DocumentDto differentDocumentDirection = new DocumentDto(documentDto);
		differentDocumentDirection.setDocumentDirection(createDocumentDirection(999, "Different Direction"));
		assertNotEquals(documentDto, differentDocumentDirection, "Objects with different documentDirection should not be equal");

		// Objekti ar dažādiem `accountPostedList`
		DocumentDto differentAccountPostedList = new DocumentDto(documentDto);
		differentAccountPostedList.setAccountPostedList(Collections.singletonList(createValidAccountPostedDto()));
		assertNotEquals(documentDto, differentAccountPostedList, "Objects with different accountPostedList should not be equal");

		// Pārbaude ar `null` vērtībām dažādos laukos
		DocumentDto nullFieldsDocument = new DocumentDto();
		assertNotEquals(documentDto, nullFieldsDocument, "Object with null fields should not be equal to a fully populated object");

		// Identiski tukši objekti
		DocumentDto emptyDocument1 = new DocumentDto();
		DocumentDto emptyDocument2 = new DocumentDto();
		assertEquals(emptyDocument1, emptyDocument2, "Empty objects should be equal");
	}

	@Test
	void testEqualsWithNull() {
		assertNotEquals(null, documentDto, "Object should not be equal to null");
	}

	@Test
	void testEqualsWithDifferentTransactionType() {
		DocumentDto differentTransactionType = new DocumentDto(documentDto);
		differentTransactionType.setDocumentTransactionType(createValidTransactionType()); // Simulē atšķirīgu transakcijas tipu
		assertNotEquals(documentDto, differentTransactionType, "Objects with different transaction types should not be equal");
	}

	@Test
	void testEqualsWithDifferentDateValues() {
		DocumentDto differentDates = new DocumentDto(documentDto);
		differentDates.setDocumentDate(documentDto.getDocumentDate().plusDays(1));
		assertNotEquals(documentDto, differentDates, "Objects with different document dates should not be equal");
	}

	@Test
	void testEqualsWithNullLists() {
		DocumentDto nullAccountPostedList = new DocumentDto(documentDto);
		nullAccountPostedList.setAccountPostedList(null);
		assertNotEquals(documentDto, nullAccountPostedList, "Object with null accountPostedList should not be equal to non-null list");
	}

}
