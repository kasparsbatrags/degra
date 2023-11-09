package lv.degra.accounting.document.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {
	@Query("SELECT d FROM DocumentType d WHERE d.id=:id")
	DocumentType getById(@Param("id") Integer id);
}
