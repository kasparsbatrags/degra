package lv.degra.accounting.core.auditor;

import org.hibernate.envers.RevisionListener;

public class AuditorRevisionListener implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        AuditorProperty auditorProperty = (AuditorProperty) revisionEntity;
    }
}
