package lv.degra.accounting.company;

import lv.degra.accounting.core.address.register.exception.DownloadAddressDataException;
import lv.degra.accounting.core.company.register.service.CompanyRegisterService;
import lv.degra.accounting.core.system.exception.ExtractZipFileException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.Scheduled;

@SpringBootApplication
@ComponentScan(basePackages = {"lv.degra.accounting.core", "lv.degra.accounting.company"})
@EnableJpaRepositories(basePackages = {"lv.degra.accounting.core"})
@EntityScan(basePackages = {"lv.degra.accounting.core"})
public class CompanyApplication {

    private final CompanyRegisterService companyRegisterService;

    public CompanyApplication(CompanyRegisterService companyRegisterService) {
        this.companyRegisterService = companyRegisterService;
    }

    public static void main(String[] args) {
        SpringApplication.run(CompanyApplication.class, args);
    }

    @Scheduled(cron = "${application.company-download-cron}")
    private void scheduleTaskUsingCronExpression() {
        try {
            companyRegisterService.importData();
        } catch (ExtractZipFileException e) {
            throw new DownloadAddressDataException(e.getMessage() + e.getCause());
        }
    }

}
