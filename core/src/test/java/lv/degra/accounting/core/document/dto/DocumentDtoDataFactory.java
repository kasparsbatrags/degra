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
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.getInboundBillDocumentSubType;
import static lv.degra.accounting.core.document.dataFactories.DocumentTransactionTypeDataFactory.createValidTransactionType;
import static lv.degra.accounting.core.exchange.CurrencyExchangeRateDataFactory.getDefaultExchangeRate;

import java.time.LocalDate;
import java.util.Collections;

import lv.degra.accounting.core.document.model.DocumentStatus;

public class DocumentDtoDataFactory {

	public static DocumentDto createValidDocumentDto() {
		DocumentDto dto = new DocumentDto();
		dto.setId(1);
		dto.setDocumentDirection(createDocumentDirection(INBOUND_ID, INBOUND_NAME));
		dto.setDocumentNumber("DOC123");
		dto.setDocumentSeries("A");
		dto.setDocumentSubType(getInboundBillDocumentSubType());
		dto.setDocumentTransactionType(createValidTransactionType());
		dto.setDocumentStatus(createApprovedStatus());
		dto.setAccountingDate(LocalDate.of(2024, 1, 1));
		dto.setDocumentDate(LocalDate.of(2024, 1, 2));
		dto.setPaymentDate(LocalDate.of(2024, 1, 15));
		dto.setPaymentTypeId(1);
		dto.setSumTotal(1000.00);
		dto.setSumTotalInCurrency(900.00);
		dto.setCurrency(getDefaultCurrency());
		dto.setExchangeRate(getDefaultExchangeRate());
		dto.setPublisherCustomer(getCustomer1());
		dto.setPublisherCustomerBank(ACUSTOMER_SWED_BANK);
		dto.setPublisherCustomerBankAccount(CUSTOMER1_BANK1_ACCOUNT1);
		dto.setReceiverCustomer(getCustomer2());
		dto.setReceiverCustomerBank(BCUSTOMER_SEB_BANK);
		dto.setReceiverCustomerBankAccount(CUSTOMER2_BANK2_ACCOUNT1);
		dto.setAccountPostedList(Collections.emptyList());
		return dto;
	}

	public static DocumentDto createDocumentDtoWithNullFields() {
		DocumentDto dto = createValidDocumentDto();
		dto.setDocumentNumber(null); // Invalid: null field
		dto.setCurrency(null);       // Invalid: null field
		return dto;
	}

	public static DocumentDto createDocumentDtoWithNegativeSum() {
		DocumentDto dto = createValidDocumentDto();
		dto.setSumTotal(-500.00); // Invalid: negative sum
		return dto;
	}

	public static DocumentDto createDocumentDtoWithLargeSum() {
		DocumentDto dto = createValidDocumentDto();
		dto.setSumTotal(1_000_000.00); // Example with large sum
		return dto;
	}

	public static DocumentDto createDocumentDtoWithCustomStatus(DocumentStatus status) {
		DocumentDto dto = createValidDocumentDto();
		dto.setDocumentStatus(status);
		return dto;
	}
}
