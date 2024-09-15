package lv.degra.accounting.core.address.register.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Setter
@Getter
@Table(name = "address_register")
@NoArgsConstructor
public class AddressRegister implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    private Integer code;
    private Integer type;
    private String status;
    private Integer parentCode;
    private Integer parentType;
    private String name;
    private String sortName;
    private String zip;
    private LocalDate dateFrom;
    private LocalDate updateDatePublic;
    private LocalDate dateTo;
    private String fullAddress;
    private Integer territorialUnitCode;
    private Instant createdAt;
    private Instant lastModifiedAt;

    public AddressRegister(Integer code, String name, Integer type, String status, LocalDate dateFrom, Integer parentCode) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.status = status;
        this.dateFrom = dateFrom;
        this.parentCode = parentCode;
    }
}
