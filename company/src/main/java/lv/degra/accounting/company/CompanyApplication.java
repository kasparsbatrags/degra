package lv.degra.accounting.company;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import lv.degra.accounting.core.company.register.service.CompanyRegisterImportService;

@SpringBootApplication
@ComponentScan(basePackages = {"lv.degra.accounting.core", "lv.degra.accounting.company"})
@EnableJpaRepositories(basePackages = {"lv.degra.accounting.core"})
@EnableFeignClients(basePackages = "lv.degra.accounting.core.user.authorize.client")
@EntityScan(basePackages = {"lv.degra.accounting.core"})
@EnableScheduling
public class CompanyApplication {

    private final CompanyRegisterImportService companyRegisterImportService;

    public CompanyApplication(CompanyRegisterImportService companyRegisterImportService) {
        this.companyRegisterImportService = companyRegisterImportService;
    }

    public static void main(String[] args) {
        SpringApplication.run(CompanyApplication.class, args);
    }

    @Scheduled(cron = "${application.company-download-cron}")
    private void scheduleTaskUsingCronExpression() {
		companyRegisterImportService.importData();
	}

}
