package lv.degra.accounting.core.user.client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;

@Configuration
public class FeignConfig {

	@Bean
	public Encoder feignFormEncoder() {
		return new SpringFormEncoder(); // Nodrošina form-urlencoded kodēšanu
	}
}