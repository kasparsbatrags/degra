package lv.degra.accounting.company;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"lv.degra.accounting.core", "lv.degra.accounting.company"})
@EnableJpaRepositories(basePackages = {"lv.degra.accounting.core"})
@EntityScan(basePackages = {"lv.degra.accounting.core"})
public class CompanyApplication {

    public static void main(String[] args) {
        SpringApplication.run(CompanyApplication.class, args);
    }

}
