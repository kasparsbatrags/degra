package lv.degra.accounting.core.document.dto;

import static lv.degra.accounting.core.currency.CurrencyDataFactory.getDefaultCurrency;
import static lv.degra.accounting.core.document.dataFactories.BankModelDataFactory.ACUSTOMER_SWED_BANK;
import static lv.degra.accounting.core.document.dataFactories.BankModelDataFactory.BCUSTOMER_SEB_BANK;
import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.CUSTOMER1_BANK1_ACCOUNT1;
import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.CUSTOMER2_BANK2_ACCOUNT1;
import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer1;
import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer2;
import static lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory.INBOUND_ID;
import static lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory.INBOUND_NAME;
import static lv.degra.accounting.core.document.dataFactories.DocumentDirectionDataFactory.createDocumentDirection;
import static lv.degra.accounting.core.document.dataFactories.DocumentStatusDataFactory.createApprovedStatus;
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.getGbsDocumentSubType;
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.getInboundBillDocumentSubType;
import static lv.degra.accounting.core.document.dataFactories.DocumentTransactionTypeDataFactory.createValidTransactionType;
import static lv.degra.accounting.core.exchange.CurrencyExchangeRateDataFactory.getDefaultExchangeRate;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Collections;

import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lv.degra.accounting.core.customer.model.Customer;

class DocumentDtoTest {

	private Validator validator;
	private DocumentDto documentDto;

	@BeforeEach
	void setUp() {
		try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
			validator = factory.getValidator();
		}

		documentDto = DocumentDto.builder()
				.id(1)
				.documentDirection(createDocumentDirection(INBOUND_ID, INBOUND_NAME))
				.documentNumber("123")
				.documentSeries("A1")
				.documentSubType(getInboundBillDocumentSubType())
				.documentTransactionType(createValidTransactionType())
				.documentStatus(createApprovedStatus())
				.publisherCustomer(getCustomer1() )
				.publisherCustomerBank(ACUSTOMER_SWED_BANK)
				.publisherCustomerBankAccount(CUSTOMER1_BANK1_ACCOUNT1)
				.receiverCustomer(getCustomer2())
				.receiverCustomerBank(BCUSTOMER_SEB_BANK)
				.receiverCustomerBankAccount(CUSTOMER2_BANK2_ACCOUNT1)
				.accountingDate(LocalDate.of(2024, 1, 1))
				.documentDate(LocalDate.of(2024, 1, 2))
				.currency(getDefaultCurrency())
				.exchangeRate(getDefaultExchangeRate())
				.publisherCustomer(new Customer())
				.receiverCustomer(new Customer())
				.accountPostedList(Collections.emptyList())
				.build();
	}

	@Test
	void testValidDocumentDto() {
		var violations = validator.validate(documentDto);
		if (!violations.isEmpty()) {
			violations.forEach(violation ->
					System.out.println("Field: " + violation.getPropertyPath() +
							", Invalid value: " + violation.getInvalidValue() +
							", Message: " + violation.getMessage()));
		}
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

		assertEquals("123", documentDto.getDocumentNumber(), "Original values should remain unchanged");
	}
}
