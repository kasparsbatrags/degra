package lv.degra.accounting.address.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${production-server-url}")
    private String productionUrl;

    @Bean
    public OpenAPI myOpenAPI() {
        Server prodServer = new Server();
        prodServer.setUrl(productionUrl);

        Contact contact = new Contact();
        contact.setEmail("info@degra.lv");
        contact.setName("Degra accounting");

        Info info = new Info()
                .title("Degra accounting system address search")
                .version("1.0")
                .contact(contact);

        return new OpenAPI().info(info).servers(List.of(prodServer));

    }}