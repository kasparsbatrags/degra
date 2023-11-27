package lv.degra.accounting.document.bill.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BillContentRepository extends JpaRepository<BillContent, Long> {
	@Query("SELECT d FROM BillContent d WHERE d.id=:id")
	BillContent getById(@Param("id") Integer id);

	@Query(value = "SELECT d.* FROM document_bill_content d WHERE d.document_id = :documentId", nativeQuery = true)
	List<BillContent> findByDocumentId(@Param("documentId") Integer documentId);
}
