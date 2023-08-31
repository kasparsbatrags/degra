package lv.degra.accounting.document.Dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.Value;
import lv.degra.accounting.currency.model.Currency;
import lv.degra.accounting.distribution.model.Distribution;
import lv.degra.accounting.exchange.model.CurrencyExchangeRate;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Set;

/**
 * DTO for {@link lv.degra.accounting.document.model.Document}
 */
@Value
@Setter
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
    CurrencyExchangeRate exchangeRate;
    String notesForCustomer;
    String internalNotes;
    Set<Distribution> distributions;
}