package lv.degra.accounting.core.system.configuration.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ConfigurationRepository extends JpaRepository<Configuration, String> {
	@Query("select c from Configuration c where c.key = ?1")
	Configuration findByKey(String key);
}
