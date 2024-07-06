package lv.degra.accounting.document.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

import org.apache.commons.lang3.StringUtils;
import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customer_account.model.CustomerAccount;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.document.model.DocumentTransactionType;
import lv.degra.accounting.document.model.DocumentType;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;
import lv.degra.accounting.system.object.TableViewInfo;

/**
 * DTO for {@link Document}
 */
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DocumentDto implements Serializable {
	Integer id;
	@TableViewInfo(displayName = "Virziens", columnOrder = 3)
	DocumentDirection documentDirection;
	String documentNumber;
	@Size(max = 20)
	@TableViewInfo(displayName = "Sērija", columnOrder = 2)
	String documentSeries;
	@TableViewInfo(displayName = "Tips", columnOrder = 4)
	DocumentType documentType;
	DocumentTransactionType documentTransactionType;

	@NotNull LocalDate accountingDate;
	@TableViewInfo(displayName = "Datums", columnOrder = 1)
	@DateTimeFormat(pattern = "dd.mm.yyyy")
	@NotNull LocalDate documentDate;
	LocalDate paymentDate;
	Integer paymentTypeId;
	@TableViewInfo(displayName = "Summa", columnOrder = 5)
	Double sumTotal;
	@TableViewInfo(displayName = "Summa valūtā", columnOrder = 8)
	Double sumTotalInCurrency;
	@TableViewInfo(displayName = "Valūta", columnOrder = 6)
	@NotNull Currency currency;
	@TableViewInfo(displayName = "Valūtas kurss", columnOrder = 7)
	@NotNull CurrencyExchangeRate currencyExchangeRate;
	String notesForCustomer;
	String internalNotes;
	@NotNull Customer publisherCustomer;
	@NotNull Bank publisherCustomerBank;
	@NotNull CustomerAccount publisherCustomerBankAccount;
	@NotNull Customer receiverCustomer;
	@NotNull Bank receiverCustomerBank;
	@NotNull CustomerAccount receiverCustomerBankAccount;


	@Override
	public boolean equals(Object obj) {
		if (this == obj) return true;
		if (obj == null || getClass() != obj.getClass()) return false;
		DocumentDto that = (DocumentDto) obj;
 		return Objects.equals(id, that.id) &&
				documentDirection == that.documentDirection &&
				StringUtils.equals(documentNumber, that.documentNumber) &&
				StringUtils.equals(documentSeries, that.documentSeries) &&
				documentType == that.documentType &&
				documentTransactionType == that.documentTransactionType &&
				Objects.equals(accountingDate, that.accountingDate) &&
				Objects.equals(documentDate, that.documentDate) &&
				Objects.equals(paymentDate, that.paymentDate) &&
				Objects.equals(paymentTypeId, that.paymentTypeId) &&
				Objects.equals(sumTotal, that.sumTotal) &&
				Objects.equals(sumTotalInCurrency, that.sumTotalInCurrency) &&
				Objects.equals(currency, that.currency) &&
				Objects.equals(currencyExchangeRate, that.currencyExchangeRate) &&
				StringUtils.equals(notesForCustomer, that.notesForCustomer) &&
				StringUtils.equals(internalNotes, that.internalNotes) &&
				Objects.equals(publisherCustomer, that.publisherCustomer) &&
				Objects.equals(publisherCustomerBank, that.publisherCustomerBank) &&
				Objects.equals(publisherCustomerBankAccount, that.publisherCustomerBankAccount) &&
				Objects.equals(receiverCustomer, that.receiverCustomer) &&
				Objects.equals(receiverCustomerBank, that.receiverCustomerBank) &&
				Objects.equals(receiverCustomerBankAccount, that.receiverCustomerBankAccount);
	}

	@Override
	public int hashCode() {
		return Objects.hash(
				id, documentDirection, documentNumber, documentSeries, documentType, documentTransactionType,
				accountingDate, documentDate, paymentDate, paymentTypeId, sumTotal, sumTotalInCurrency,
				currency, currencyExchangeRate, notesForCustomer, internalNotes,
				publisherCustomer, publisherCustomerBank, publisherCustomerBankAccount,
				receiverCustomer, receiverCustomerBank, receiverCustomerBankAccount
		);
	}

}