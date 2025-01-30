package lv.degra.accounting.core.validation.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface ValidationRuleRepository extends JpaRepository<ValidationRule, Long> {

	List<ValidationRule> findByDocumentSubTypeId(@Param("documentSubtypeId") Integer documentSubtypeId);
}
