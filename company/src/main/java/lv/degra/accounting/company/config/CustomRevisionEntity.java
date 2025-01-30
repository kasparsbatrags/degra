package lv.degra.accounting.company.config;

import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionEntity;

import jakarta.persistence.Entity;

@Entity
@RevisionEntity
public class CustomRevisionEntity extends DefaultRevisionEntity {
    private static final long serialVersionUID = 1L;
}
