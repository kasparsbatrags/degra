package lv.degra.accounting.core.company.type.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lv.degra.accounting.core.auditor.AuditorRevisionListener;
import lv.degra.accounting.core.auditor.model.AuditInfo;
import org.hibernate.envers.Audited;

import java.io.Serializable;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners({AuditorRevisionListener.class})
@Audited
public class CompanyType extends AuditInfo implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;
    private String code;
    private String name;
}
