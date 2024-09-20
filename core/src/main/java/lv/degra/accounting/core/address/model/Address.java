package lv.degra.accounting.core.address.model;

import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.auditor.AuditorRevisionListener;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import lv.degra.accounting.core.customer.model.Customer;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import java.util.Set;

@Entity
@Setter
@Getter
@Table(name = "address")
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditorRevisionListener.class)
@Audited
public class Address extends AuditInfo implements Serializable {
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
    private String sortByValue;
    private String zip;
    private LocalDate dateFrom;
    private LocalDate updateDatePublic;
    private LocalDate dateTo;
    @Column(name = "full_name")
    private String fullAddress;
    private Integer territorialUnitCode;

    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @NotAudited
    private Set<Customer> customers;

    public Address(Integer code, String name, Integer type, String status, LocalDate dateFrom) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.status = status;
        this.dateFrom = dateFrom;
    }

}
