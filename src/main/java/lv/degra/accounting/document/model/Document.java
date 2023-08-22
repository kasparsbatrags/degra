package lv.degra.accounting.document.model;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NonNull
    @Column(length = 20)
    private String number;

    @Column(length = 20)
    private String internalNumber;

//    private Integer srsTypeId;
    private LocalDate accountingDate;
    private LocalDate documentDate;
    private LocalDate paymentDate;
    private Double sumTotal;
//    private Integer currencyId;
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
