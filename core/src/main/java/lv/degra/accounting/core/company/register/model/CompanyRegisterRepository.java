package lv.degra.accounting.core.company.register.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRegisterRepository extends JpaRepository<CompanyRegister, Integer> {
	boolean existsByRegisterNumber(String registerNumber);

	@Query(value = """
			   SELECT c.* FROM company_register c 
			   	WHERE 
			   	(
						to_tsvector('simple', c.name) @@ plainto_tsquery('simple', :name) 
					    OR c.register_number LIKE :name || '%'
				)
			   	AND c.terminated_date IS NULL 
			   	ORDER BY similarity(c.name, :name) DESC, c.name ASC 
			   	LIMIT 15
			""", nativeQuery = true)
	List<CompanyRegister> findTopByNameContainingIgnoreCase(String name);
}
