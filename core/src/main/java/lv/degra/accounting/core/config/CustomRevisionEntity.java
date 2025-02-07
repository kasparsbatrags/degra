package lv.degra.accounting.core.config;

import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@RevisionEntity
@Table(name = "revision_entity")
public class CustomRevisionEntity extends DefaultRevisionEntity {
    private static final long serialVersionUID = 1L;
}
