package lv.degra.accounting.usermanager.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    @Value("${springdoc.server.dev.url:http://localhost:8080}")
    private String devUrl;
    
    @Value("${springdoc.server.test.url:https://test-api.degra.lv}")
    private String testUrl;
    
    @Value("${springdoc.server.prod.url:https://api.degra.lv}")
    private String prodUrl;
    
    @Value("${spring.profiles.active:dev-usermanager}")
    private String activeProfile;

    @Bean
    public OpenAPI customOpenAPI() {
        // Determine which server should be the default based on active profile
        List<Server> servers = new ArrayList<>();
        
        if (activeProfile.contains("prod")) {
            servers.add(new Server().url(prodUrl).description("Production Server"));
            servers.add(new Server().url(testUrl).description("Test Server"));
            servers.add(new Server().url(devUrl).description("Development Server"));
        } else if (activeProfile.contains("test")) {
            servers.add(new Server().url(testUrl).description("Test Server"));
            servers.add(new Server().url(devUrl).description("Development Server"));
            servers.add(new Server().url(prodUrl).description("Production Server"));
        } else {
            servers.add(new Server().url(devUrl).description("Development Server"));
            servers.add(new Server().url(testUrl).description("Test Server"));
            servers.add(new Server().url(prodUrl).description("Production Server"));
        }
        
        return new OpenAPI()
                .info(new Info()
                        .title("UserManager API")
                        .version("1.0")
                        .description("API for user management operations")
                        .contact(new Contact()
                                .name("Degra")
                                .url("https://degra.lv")))
                .servers(servers)
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", 
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
