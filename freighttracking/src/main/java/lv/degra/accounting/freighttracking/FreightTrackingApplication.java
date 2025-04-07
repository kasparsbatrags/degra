package lv.degra.accounting.freighttracking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableConfigurationProperties
@EnableFeignClients(basePackages = "lv.degra.accounting.core.user.authorize.client")
@ComponentScan(basePackages = { "lv.degra.accounting.core", "lv.degra.accounting.freighttracking" })
@EntityScan(basePackages = { "lv.degra.accounting.core" })
@EnableJpaRepositories(basePackages = "lv.degra.accounting.core")
public class FreightTrackingApplication {

	public static void main(String[] args) {
		SpringApplication.run(FreightTrackingApplication.class, args);
	}

}
