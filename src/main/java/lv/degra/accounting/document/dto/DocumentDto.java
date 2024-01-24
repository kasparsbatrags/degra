package lv.degra.accounting.document.dto;

import java.io.Serializable;
import java.time.LocalDate;

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
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;
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
	@NotNull CustomerBankAccount publisherCustomerBankAccount;
	@NotNull Customer receiverCustomer;
	@NotNull Bank receiverCustomerBank;
	@NotNull CustomerBankAccount receiverCustomerBankAccount;

}