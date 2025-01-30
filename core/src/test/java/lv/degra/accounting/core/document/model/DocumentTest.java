package lv.degra.accounting.core.document.model;

import static lv.degra.accounting.core.account.posted.AccountPostedDataFactory.createAccountPostedWithNegativeAmount;
import static lv.degra.accounting.core.account.posted.AccountPostedDataFactory.createValidAccountPosted;
import static lv.degra.accounting.core.currency.CurrencyDataFactory.getUsdCurrency;
import static lv.degra.accounting.core.document.dataFactories.BankDataFactory.ACUSTOMER_SWED_BANK2;
import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.CUSTOMER2_BANK1_ACCOUNT2;
import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.CUSTOMER6_BANK1_ACCOUNT3;
import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer1;
import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer2;
import static lv.degra.accounting.core.document.dataFactories.DocumentDataFactory.createValidDocument;
import static lv.degra.accounting.core.document.dataFactories.DocumentStatusDataFactory.createApprovedStatus;
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.createValidDocumentSubType;
import static lv.degra.accounting.core.document.dataFactories.DocumentTransactionTypeDataFactory.createValidTransactionType;
import static lv.degra.accounting.core.exchange.CurrencyExchangeRateDataFactory.getGbpExchangeRate;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.account.posted.model.AccountPosted;
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
		Document document = createValidDocument();
		var violations = validator.validate(document);
		violations.forEach(violation -> System.out.println(
				"Field: " + violation.getPropertyPath() + ", Invalid value: " + violation.getInvalidValue() + ", Message: "
						+ violation.getMessage()));
		assertTrue(violations.isEmpty(), "Valid document should pass validation");
	}

	@Test
	void testDocumentWithNullField() {
		Document document = DocumentDataFactory.createDocumentWithNullField();
		var violations = validator.validate(document);

		assertFalse(violations.isEmpty(), "Document with null field should fail validation");
		violations.forEach(violation -> System.out.println(
				"Field: " + violation.getPropertyPath() + ", Invalid value: " + violation.getInvalidValue() + ", Message: "
						+ violation.getMessage()));
	}

	@Test
	void testDocumentWithNegativeTotal() {
		Document document = DocumentDataFactory.createDocumentWithNegativeTotal();
		var violations = validator.validate(document);

		assertFalse(violations.isEmpty(), "Document with negative sum should fail validation");
	}

	@Test
	void testEqualsAndHashCode() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setId(document1.getId()); // Ensure IDs match for equality

		assertEquals(document1, document2, "Objects with same data should be equal");
		assertEquals(document1.hashCode(), document2.hashCode(), "Hash codes should match");
	}

	@Test
	void testToString() {
		Document document = createValidDocument();
		assertEquals("DOC123", document.getDocumentNumber(), "toString should return the document number");
	}

	@Test
	void testEqualsSameObject() {
		Document document = createValidDocument();
		assertEquals(document, document, "An object should be equal to itself");
	}

	@Test
	void testEqualsWithNull() {
		Document document = createValidDocument();
		assertNotEquals(null, document, "An object should not be equal to null");
	}

	@Test
	void testEqualsWithDifferentClass() {
		Document document = createValidDocument();
		String otherObject = "Some String";
		assertNotEquals(document, otherObject, "An object should not be equal to an instance of a different class");
	}

	@Test
	void testEqualsWithEqualObjects() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		assertEquals(document1, document2, "Objects with identical values should be equal");
	}

	@Test
	void testEqualsWithDifferentId() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setId(999);
		assertNotEquals(document1, document2, "Objects with different IDs should not be equal");
	}

	@Test
	void testEqualsWithDifferentDocumentNumber() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentNumber("DIFFERENT");
		assertNotEquals(document1, document2, "Objects with different document numbers should not be equal");
	}

	@Test
	void testEqualsWithTheSameDocumentNumber() {
		Document document1 = createValidDocument();
		document1.setDocumentNumber("THE-SAME");
		Document document2 = createValidDocument();
		document2.setDocumentNumber("THE-SAME");
		assertEquals(document1, document2, "Objects with The Same document numbers should be equal");
	}

	@Test
	void testEqualsWithDifferentDocumentSeries() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentSeries("DIFFERENT");
		assertNotEquals(document1, document2, "Objects with different document series should not be equal");
	}

	@Test
	void testEqualsWithTheSameDocumentSeries() {
		Document document1 = createValidDocument();
		document1.setDocumentSeries("THE-SAME");
		Document document2 = createValidDocument();
		document2.setDocumentSeries("THE-SAME");
		assertEquals(document1, document2, "Objects with different document series should not be equal");
	}

	@Test
	void testEqualsWithDifferentAccountingDate() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setAccountingDate(LocalDate.now().minusDays(1));
		assertNotEquals(document1, document2, "Objects with different accounting dates should not be equal");
	}

	@Test
	void testEqualsWithDifferentDocumentDate() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentDate(LocalDate.now().minusDays(1));
		assertNotEquals(document1, document2, "Objects with different document dates should not be equal");
	}

	@Test
	void testEqualsWithDifferentSumTotal() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setSumTotal(101.01);
		assertNotEquals(document1, document2, "Objects with different document dates should not be equal");
	}

	@Test
	void testEqualsWithDifferentSumTotalInCurrency() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setSumTotalInCurrency(101.01);
		assertNotEquals(document1, document2, "Objects with different document dates should not be equal");
	}


	@Test
	void testEqualsWithDifferentAccountPostedList() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setAccountPostedList(Collections.singletonList(createValidAccountPosted()));
		assertNotEquals(document1, document2, "Objects with different account posted lists should not be equal");
	}

	@Test
	void testEqualsWithNullFields() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentNumber(null);
		assertNotEquals(document1, document2, "Objects with one null documentNumber should not be equal");

		document2.setDocumentSeries(null);
		assertNotEquals(document1, document2, "Objects with one null documentSeries should not be equal");

		document2.setAccountingDate(null);
		assertNotEquals(document1, document2, "Objects with one null accountingDate should not be equal");
	}

	@Test
	void testEqualsWithDifferentValuesInPostedList() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();

		document1.setAccountPostedList(Collections.singletonList(createValidAccountPosted()));
		document2.setAccountPostedList(Collections.singletonList(createAccountPostedWithNegativeAmount())); // Different posted list
		assertNotEquals(document1, document2, "Objects with different account posted lists should not be equal");
	}

	@Test
	void testHashCodeConsistency() {
		Document document = createValidDocument();
		int hashCode1 = document.hashCode();
		int hashCode2 = document.hashCode();
		assertEquals(hashCode1, hashCode2, "HashCode should be consistent across multiple invocations");
	}

	@Test
	void testEqualsWithDifferentObject() {
		Document document1 = createValidDocument();
		assertNotEquals(document1, null, "Objects with different object type should not be equal");
		assertNotEquals(document1, new Object(), "Objects with different object type should not be equal");
	}

	@Test
	void testEqualsWithDifferentPaymentDate() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPaymentDate(LocalDate.now().minusDays(1));
		assertNotEquals(document1, document2, "Objects with different payment dates should not be equal");
	}

	@Test
	void testEqualsWithNullPaymentDate() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPaymentDate(null);
		assertNotEquals(document1, document2, "Objects with one null payment date should not be equal");
	}

	@Test
	void testEqualsWithDifferentCurrency() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setCurrency(getUsdCurrency());
		assertNotEquals(document1, document2, "Objects with different currencies should not be equal");
	}

	@Test
	void testEqualsWithNullCurrency() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setCurrency(null);
		assertNotEquals(document1, document2, "Objects with one null currency should not be equal");
	}

	@Test
	void testEqualsWithEmptyAccountPostedList() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document1.setAccountPostedList(Collections.emptyList());
		document2.setAccountPostedList(Collections.singletonList(createValidAccountPosted()));
		assertNotEquals(document1, document2, "Objects with empty and non-empty account posted lists should not be equal");
	}

	@Test
	void testEqualsWithNullAccountPostedList() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setAccountPostedList(null);
		assertNotEquals(document1, document2, "Objects with one null account posted list should not be equal");
	}

	@Test
	void testEqualsWithIdenticalAccountPostedListReferences() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		List<AccountPosted> sameList = Collections.singletonList(createValidAccountPosted());
		document1.setAccountPostedList(sameList);
		document2.setAccountPostedList(sameList);
		assertEquals(document1, document2, "Objects with the same account posted list references should be equal");
	}

	@Test
	void testEqualsWithDifferentDocumentSubType() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentSubType(createValidDocumentSubType());
		assertNotEquals(document1, document2, "Objects with different document subtypes should not be equal");
	}

	@Test
	void testEqualsWithNullDocumentSubType() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentSubType(null);
		assertNotEquals(document1, document2, "Objects with one null document subtype should not be equal");
	}

	@Test
	void testEqualsWithDifferentInternalNotes() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setInternalNotes("Different Internal Notes");
		assertNotEquals(document1, document2, "Objects with different internal notes should not be equal");
	}

	@Test
	void testEqualsWithNullInternalNotes() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setInternalNotes(null);
		assertNotEquals(document1, document2, "Objects with one null internal notes should not be equal");
	}

	@Test
	void testEqualsWithNullNotesForCustomer() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setNotesForCustomer(null);
		assertNotEquals(document1, document2, "Objects with one null notes for Customer should not be equal");
	}

	@Test
	void testEqualsWithDifferentPublisherCustomer() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPublisherCustomer(getCustomer2());
		assertNotEquals(document1, document2, "Objects with different publisher customers should not be equal");
	}

	@Test
	void testEqualsWithNullPublisherCustomer() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPublisherCustomer(null);
		assertNotEquals(document1, document2, "Objects with one null publisher customer should not be equal");
	}

	@Test
	void testEqualsWithDifferentReceiverCustomer() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setReceiverCustomer(getCustomer1());
		assertNotEquals(document1, document2, "Objects with different receiver customers should not be equal");
	}

	@Test
	void testEqualsWithNullReceiverCustomer() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setReceiverCustomer(null);
		assertNotEquals(document1, document2, "Objects with one null receiver customer should not be equal");
	}

	@Test
	void testEqualsWithDifferentDocumentStatus() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentStatus(createApprovedStatus());
		assertNotEquals(document1, document2, "Objects with different document statuses should not be equal");
	}

	@Test
	void testEqualsWithNullDocumentStatus() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentStatus(null);
		assertNotEquals(document1, document2, "Objects with one null document status should not be equal");
	}

	@Test
	void testEqualsWithDifferentPublisherCustomerBank() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPublisherCustomerBank(ACUSTOMER_SWED_BANK2);
		assertNotEquals(document1, document2, "Objects with different publisher customer banks should not be equal");
	}

	@Test
	void testEqualsWithNullPublisherCustomerBank() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPublisherCustomerBank(null);
		assertNotEquals(document1, document2, "Objects with one null publisher customer bank should not be equal");
	}

	@Test
	void testEqualsWithDifferentPublisherCustomerBankAccount() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPublisherCustomerBankAccount(CUSTOMER2_BANK1_ACCOUNT2);
		assertNotEquals(document1, document2, "Objects with different publisher customer bank accounts should not be equal");
	}

	@Test
	void testEqualsWithNullPublisherCustomerBankAccount() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPublisherCustomerBankAccount(null);
		assertNotEquals(document1, document2, "Objects with one null publisher customer bank account should not be equal");
	}

	@Test
	void testEqualsWithDifferentReceiverCustomerBank() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setReceiverCustomerBank(ACUSTOMER_SWED_BANK2);
		assertNotEquals(document1, document2, "Objects with different receiver customer banks should not be equal");
	}

	@Test
	void testEqualsWithNullReceiverCustomerBank() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setReceiverCustomerBank(null);
		assertNotEquals(document1, document2, "Objects with one null receiver customer bank should not be equal");
	}

	@Test
	void testEqualsWithDifferentReceiverCustomerBankAccount() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setReceiverCustomerBankAccount(CUSTOMER6_BANK1_ACCOUNT3);
		assertNotEquals(document1, document2, "Objects with different receiver customer bank accounts should not be equal");
	}

	@Test
	void testEqualsWithNullReceiverCustomerBankAccount() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setReceiverCustomerBankAccount(null);
		assertNotEquals(document1, document2, "Objects with one null receiver customer bank account should not be equal");
	}


	@Test
	void testEqualsWithDifferentDocumentTransactionType() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		DocumentTransactionType documentTransactionType = createValidTransactionType();
		documentTransactionType.setCode("DIF");
		document2.setDocumentTransactionType(documentTransactionType);
		assertNotEquals(document1, document2, "Objects with different document transaction types should not be equal");
	}

	@Test
	void testEqualsWithNullDocumentTransactionType() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setDocumentTransactionType(null);
		assertNotEquals(document1, document2, "Objects with one null document transaction type should not be equal");
	}

	@Test
	void testEqualsWithDifferentPaymentTypeId() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPaymentTypeId(999);
		assertNotEquals(document1, document2, "Objects with different payment type IDs should not be equal");
	}


	@Test
	void testEqualsWithNullPaymentTypeId() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setPaymentTypeId(null);
		assertNotEquals(document1, document2, "Objects with one null payment type ID should not be equal");
	}

	@Test
	void testEqualsWithDifferentExchangeRate() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setExchangeRate(getGbpExchangeRate());
		assertNotEquals(document1, document2, "Objects with different exchange rates should not be equal");
	}

	@Test
	void testEqualsWithNullExchangeRate() {
		Document document1 = createValidDocument();
		Document document2 = createValidDocument();
		document2.setExchangeRate(null);
		assertNotEquals(document1, document2, "Objects with one null exchange rate should not be equal");
	}


}
