package lv.degra.accounting.core.company.register.model;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.company.type.model.CompanyType;

import java.io.Serializable;
import java.time.LocalDate;

import static org.apache.logging.log4j.util.Strings.EMPTY;


@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRegister implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    private String registerNumber;

    private String sepaCode;

    private String name;

    private String nameBeforeQuotes;

    private String nameInQuotes;

    private String nameAfterQuotes;

    private String withoutQuotes;
    @ManyToOne(cascade = CascadeType.REFRESH, fetch = FetchType.LAZY)
    @JoinColumn(name = "company_type_id", nullable = false)
    private CompanyType companyType;

    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate registeredDate;

    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate terminatedDate;

    public String getNameNormalized() {
        return this.getNameInQuotes()
                + (", " + this.getCompanyType().getCode().replace(",", EMPTY));
    }


}
