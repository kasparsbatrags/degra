package lv.degra.accounting.document.dto;

import java.time.LocalDate;

import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer_account.model.CustomerAccount;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.document.model.DocumentTransactionType;
import lv.degra.accounting.document.model.DocumentType;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.system.exception.IllegalDataArgumentException;

public class DocumentDtoValidator {

	public static DocumentDto validateAndCreateDocumentDto(Integer documentId, DocumentDirection documentDirection, String documentNumber,
			String documentSeries, DocumentType documentType, DocumentTransactionType documentTransactionType, LocalDate accountingDate,
			LocalDate documentDate, LocalDate paymentDate, Integer paymentTypeId, Double sumTotal, Double sumTotalInCurrency,
			Currency currency, CurrencyExchangeRate currencyExchangeRate, String notesForCustomer, String internalNotes,
			Customer publisherCustomer, Bank publisherCustomerBank, CustomerAccount publisherCustomerBankAccount,
			Customer receiverCustomer, Bank receiverCustomerBank, CustomerAccount receiverCustomerBankAccount) {
		validateNotNull("DocumentDirection", documentDirection);
		validateNotNull("DocumentNumber", documentNumber);
		validateStringLength("DocumentSeries", documentSeries, 20);
		validateNotNull("DocumentType", documentType);
		validateNotNull("DocumentTransactionType", documentTransactionType);
		validateNotNull("AccountingDate", accountingDate);
		validateNotNull("DocumentDate", documentDate);

		return new DocumentDto(documentId, documentDirection, documentNumber, documentSeries, documentType, documentTransactionType,
				accountingDate, documentDate, paymentDate, paymentTypeId, sumTotal, sumTotalInCurrency, currency, currencyExchangeRate,
				notesForCustomer, internalNotes, publisherCustomer, publisherCustomerBank, publisherCustomerBankAccount, receiverCustomer,
				receiverCustomerBank, receiverCustomerBankAccount);
	}

	private static <T> void validateNotNull(String fieldName, T value) {
		if (value == null) {
			throw new IllegalDataArgumentException("Lauks" + fieldName + " nav aizpildīts!");
		}
	}

	private static void validateStringLength(String fieldName, String value, int maxLength) {
		validateNotNull(fieldName, value);
		if (value.length() > maxLength) {
			throw new IllegalDataArgumentException("Laukā " + fieldName + " pārāk daudz sibolu. Atļauti tikai " + maxLength + " siboli!");
		}
	}

	public static String validateDateNotNull(Object object) {
		return null == object ? "Obligāti jāaizpilda!" : null;
	}
}


