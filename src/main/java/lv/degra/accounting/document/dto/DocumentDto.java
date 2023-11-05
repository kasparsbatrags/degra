package lv.degra.accounting.document.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lv.degra.accounting.bank.model.Bank;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.customerAccount.model.CustomerBankAccount;
import lv.degra.accounting.document.enums.DocumentDirection;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;

import java.io.Serializable;
import java.time.LocalDate;

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
    DocumentDirection documentDirection;
    @Size(max = 20) String documentNumber;
    @Size(max = 20) String internalNumber;
    Integer srsTypeId;
    @NotNull LocalDate accountingDate;
    @NotNull LocalDate documentDate;
    LocalDate paymentDate;
    Integer paymentTypeId;
    Double sumTotal;
    Double sumTotalInCurrency;
    @NotNull Currency currency;
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