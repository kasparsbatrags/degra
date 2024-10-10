package lv.degra.accounting.address.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    @Value("${application.server-url}")
    private String serverUrl;

    @Bean
    public OpenAPI myOpenAPI() {
        Server prodServer = new Server();
        prodServer.setUrl(serverUrl);

        Contact contact = new Contact();
        contact.setEmail("info@degra.lv");
        contact.setName("Degra accounting");

        Info info = new Info()
                .title("Degra accounting system address search")
                .version("1.0")
                .contact(contact);

        return new OpenAPI().info(info).servers(List.of(prodServer));

    }}