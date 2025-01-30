package lv.degra.accounting.usermanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;

@Configuration
public class UserManagerFeignConfig {
    
    @Bean
    public Encoder feignFormEncoder() {
        return new SpringFormEncoder();
    }
}
