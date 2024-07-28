package lv.degra.accounting.validation.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ValidationRulesRepository extends JpaRepository<ValidationRule, Long> {

	@Query(value = "SELECT r.* FROM validation_rule r WHERE r.document_sub_type_id = :documentSubtypeId", nativeQuery = true)
	List<ValidationRule> getByDocumentSubTypeId(@Param("documentSubtypeId") Integer documentSubtypeId);
}
