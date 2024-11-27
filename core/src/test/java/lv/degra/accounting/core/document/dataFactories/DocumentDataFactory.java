package lv.degra.accounting.core.document.dataFactories;

import static lv.degra.accounting.core.currency.CurrencyDataFactory.getDefaultCurrency;
import static lv.degra.accounting.core.document.dataFactories.BankModelDataFactory.ACUSTOMER_SWED_BANK;
import static lv.degra.accounting.core.document.dataFactories.BankModelDataFactory.BCUSTOMER_SEB_BANK;
import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.CUSTOMER1_BANK1_ACCOUNT1;
import static lv.degra.accounting.core.document.dataFactories.CustomerAccountDataFactory.CUSTOMER2_BANK2_ACCOUNT1;
import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer1;
import static lv.degra.accounting.core.document.dataFactories.CustomersData.getCustomer2;
import static lv.degra.accounting.core.document.dataFactories.DocumentStatusDataFactory.createNewStatus;
import static lv.degra.accounting.core.document.dataFactories.DocumentSubTypeDataFactory.getInboundBillDocumentSubType;
import static lv.degra.accounting.core.exchange.CurrencyExchangeRateDataFactory.getDefaultExchangeRate;

import java.time.LocalDate;
import java.util.Collections;

import lv.degra.accounting.core.document.model.Document;

public class DocumentDataFactory {

	public static Document createValidDocument() {
		Document document = new Document();
		document.setId(1);
		document.setDocumentNumber("DOC123");
		document.setDocumentSeries("A");
		document.setDocumentSubType(getInboundBillDocumentSubType());
		document.setAccountingDate(LocalDate.of(2024, 1, 1));
		document.setDocumentDate(LocalDate.of(2024, 1, 2));
		document.setPaymentDate(LocalDate.of(2024, 1, 15));
		document.setPaymentTypeId(1);
		document.setSumTotal(1000.00);
		document.setSumTotalInCurrency(1000.00);
		document.setCurrency(getDefaultCurrency());
		document.setExchangeRate(getDefaultExchangeRate());
		document.setPublisherCustomer(getCustomer1());
		document.setReceiverCustomer(getCustomer2());
		document.setPublisherCustomerBank(ACUSTOMER_SWED_BANK);
		document.setReceiverCustomerBank(BCUSTOMER_SEB_BANK);
		document.setPublisherCustomerBankAccount(CUSTOMER1_BANK1_ACCOUNT1);
		document.setReceiverCustomerBankAccount(CUSTOMER2_BANK2_ACCOUNT1);
		document.setDocumentStatus(createNewStatus());
		document.setAccountPostedList(Collections.emptyList());

		return document;
	}

	public static Document createDocumentWithNullField() {
		Document document = createValidDocument();
		document.setDocumentSubType(null); // Invalid: cannot be null
		return document;
	}

	public static Document createDocumentWithNegativeTotal() {
		Document document = createValidDocument();
		document.setSumTotal(-500.00); // Invalid: sum should be positive
		return document;
	}
}

