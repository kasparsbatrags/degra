package lv.degra.accounting.documents.model;

import lombok.Data;
import lombok.NonNull;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NonNull
    @Column(length = 20)
    private String number;

    @Column(length = 20)
    private String internal_number;

    private Integer srsTypeId;
    private LocalDate document_date;
    private LocalDate service_date;
    private LocalDate payment_date;
    private Integer paymentTypeId;
    private Integer currencyId;
    private Double exchangeRate;

    private Integer publisherCustomerId;
    private Integer publisherCustomerBankId;
    private Integer publisherCustomerBankAccountId;
    private Integer secondaryPublisherCustomerId;

    private Integer receiverCustomerId;
    private Integer receiverCustomerBankId;
    private Integer receiverCustomerBankAccountId;
    private Integer secondaryReceiverCustomerId;


    private String notesForCustomer;
    private String internalNotes;

    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;

}
