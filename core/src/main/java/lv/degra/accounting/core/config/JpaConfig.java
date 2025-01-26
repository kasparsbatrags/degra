package lv.degra.accounting.core.config;

import org.hibernate.envers.configuration.EnversSettings;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaAuditing
public class JpaConfig {

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return hibernateProperties -> {
            hibernateProperties.put(EnversSettings.AUDIT_TABLE_SUFFIX, "_AUDIT");
            hibernateProperties.put(EnversSettings.REVISION_FIELD_NAME, "REV");
            hibernateProperties.put(EnversSettings.REVISION_TYPE_FIELD_NAME, "REVTYPE");
            hibernateProperties.put(EnversSettings.STORE_DATA_AT_DELETE, true);
        };
    }
}
