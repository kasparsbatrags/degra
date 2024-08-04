package lv.degra.accounting.core.document.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentSubTypeRepository extends JpaRepository<DocumentSubType, Long> {
}
