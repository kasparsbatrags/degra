package lv.degra.accounting.core.validation.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ValidationRulesRepository extends JpaRepository<ValidationRule, Long> {

    List<ValidationRule> findByDocumentSubTypeId(@Param("documentSubtypeId") Integer documentSubtypeId);
}
