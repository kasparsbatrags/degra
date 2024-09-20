package lv.degra.accounting.core.address.register.model;

import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.address.register.view.AddressPublicView;
import lv.degra.accounting.core.auditor.AuditorRevisionListener;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Setter
@Getter
@Table(name = "address_register")
@EntityListeners({AuditingEntityListener.class})
@NoArgsConstructor
public class AddressRegister implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;
    @JsonView({AddressPublicView.class})
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
    @JsonView({AddressPublicView.class})
    private String fullAddress;
    private Integer territorialUnitCode;

    public AddressRegister(Integer code, String name, Integer type, String status, LocalDate dateFrom, Integer parentCode) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.status = status;
        this.dateFrom = dateFrom;
        this.parentCode = parentCode;
    }
}
