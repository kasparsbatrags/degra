package lv.degra.accounting.address;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = {"lv.degra.accounting.core", "lv.degra.accounting.address"})
@EnableJpaRepositories(basePackages = {"lv.degra.accounting.core"})
@EntityScan(basePackages = {"lv.degra.accounting.core"})
@EnableScheduling
@EnableCaching
public class AddressApplication {

    public static void main(String[] args) {
        SpringApplication.run(AddressApplication.class, args);
    }


//    @Scheduled(cron = "${application.address-download-cron}")
//    private void scheduleTaskUsingCronExpression() {
//        try {
//            downloadArData();
//        } catch (ExtractZipFileException e) {
//            throw new DownloadAddressDataException(e.getMessage() + e.getCause());
//        }
//    }
}