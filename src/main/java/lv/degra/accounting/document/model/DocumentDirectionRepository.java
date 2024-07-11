package lv.degra.accounting.document.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentDirectionRepository extends JpaRepository<DocumentDirection, Long> {
}
