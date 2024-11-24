package lv.degra.accounting.core.currency.model;

import java.io.Serializable;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lv.degra.accounting.core.auditor.model.AuditInfo;

@Getter
@Setter
@Entity
@Table(name = "currency")
@Audited
public class Currency extends AuditInfo implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "currency_code", length = 3)
    private String currencyCode;

    @Column(name = "currency_name", length = 100)
    private String currencyName;

    @Column(name = "subunit_name", length = 100)
    private String subunitName;

    @Override
    public String toString() {
        return getCurrencyCode();
    }

}