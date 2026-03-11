package com.agrocare.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Agrocare Healthcare API")
                        .version("1.0.0")
                        .description("""
                                Agrocare is a comprehensive healthcare community platform API.
                                
                                ## Features
                                - User Authentication (JWT)
                                - Q&A System
                                - Doctor Profiles
                                - Appointments
                                - Medical Centers
                                - Content Moderation
                                
                                ## Authentication
                                Most endpoints require authentication. Use the `/auth/login` endpoint to get a JWT token.
                                Include the token in the Authorization header: `Bearer <token>`
                                """)
                        .contact(new Contact()
                                .name("Agocare Team")
                                .email("support@agrocare.com")
                                .url("https://agrocare.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token")));
    }
}
