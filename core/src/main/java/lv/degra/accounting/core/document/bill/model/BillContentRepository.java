package lv.degra.accounting.core.document.bill.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillContentRepository extends JpaRepository<BillContent, Long> {
    List<BillContent> getByDocumentId(@Param("documentId") Integer documentId);
}
