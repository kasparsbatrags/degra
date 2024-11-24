package lv.degra.accounting.core.company.register.model;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CompanyRegisterRepository extends JpaRepository<CompanyRegister, Integer> {

	@Query("SELECT c FROM CompanyRegister c WHERE lower(c.name) LIKE lower(concat('%', :name, '%')) ORDER BY c.name ASC LIMIT 15")
	List<CompanyRegister> findTopByNameContainingIgnoreCase(String name);
}
