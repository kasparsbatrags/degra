package lv.degra.accounting.core.system.configuration.model;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfigurationRepository extends JpaRepository<Configuration, String> {
	Configuration findByKey(String key);
}
