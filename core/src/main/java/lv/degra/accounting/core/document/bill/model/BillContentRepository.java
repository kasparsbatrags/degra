package lv.degra.accounting.core.document.bill.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BillContentRepository extends JpaRepository<BillContent, Long> {
	List<BillContent> getByDocumentId(@Param("documentId") Integer documentId);
}
