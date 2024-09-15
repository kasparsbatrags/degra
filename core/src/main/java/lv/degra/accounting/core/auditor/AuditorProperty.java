package lv.degra.accounting.core.auditor;


import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

@Entity
@Setter
@Getter
@RevisionEntity(AuditorRevisionListener.class)
public class AuditorProperty {
    @Id
    @RevisionNumber
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long revisionId;

    @RevisionTimestamp
    private long revisionTimestamp;

}