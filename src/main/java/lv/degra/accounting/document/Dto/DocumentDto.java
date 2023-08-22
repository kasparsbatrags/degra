package lv.degra.accounting.document.Dto;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Setter
@Getter
public class DocumentDto {

    private Integer id;

    @Size(max = 20)
    private String number;

    @Size(max = 20)
    private String internalNumber;

    private Integer srsTypeId;

    private LocalDate accountingDate;
    private LocalDate documentDate;
    private LocalDate paymentDate;
    private Double sumTotal;
    @Size(max = 3)
    private String currency;
    private Double exchangeRate;

//    private Integer publisherCustomerId;
//    private Integer publisherCustomerBankId;
//    private Integer publisherCustomerBankAccountId;
//    private Integer secondaryPublisherCustomerId;
//
//    private Integer receiverCustomerId;
//    private Integer receiverCustomerBankId;
//    private Integer receiverCustomerBankAccountId;
//    private Integer secondaryReceiverCustomerId;


    private String notesForCustomer;
    private String internalNotes;

    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;

}
