package lv.degra.accounting.document.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.customer.model.Customer;
import lv.degra.accounting.document.model.Document;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link Document}
 */
@Value
public class DocumentDto implements Serializable {
    Integer id;
    @NotNull
    @Size(max = 20)
    String number;
    @Size(max = 20)
    String internalNumber;
    Integer srsTypeId;
    @NotNull
    LocalDate accountingDate;
    @NotNull
    LocalDate documentDate;
    LocalDate paymentDate;
    Integer paymentTypeId;
    @NotNull
    Double sumTotal;
    @NotNull
    Currency currency;
    @NotNull
    CurrencyExchangeRate currencyExchangeRate;
    String notesForCustomer;
    String internalNotes;
    Customer publisherCustomer;
    @NotNull
    Customer receiverCustomer;
}