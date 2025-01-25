package lv.degra.accounting.usermanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import lv.degra.accounting.core.company.register.service.CompanyRegisterImportServiceImpl;

@EnableConfigurationProperties
@EnableFeignClients(basePackages = "lv.degra.accounting.usermanager.client")
@SpringBootApplication
@ComponentScan(basePackages = { "lv.degra.accounting.core", "lv.degra.accounting.usermanager" },
		excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
				classes = { lv.degra.accounting.core.system.files.FileServiceImpl.class,
						lv.degra.accounting.core.address.register.service.AddressRegisterServiceImpl.class,
						CompanyRegisterImportServiceImpl.class}))
@EnableJpaRepositories(basePackages = { "lv.degra.accounting.core" })
@EntityScan(basePackages = { "lv.degra.accounting.core" })
public class UserManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserManagerApplication.class, args);
	}

}
