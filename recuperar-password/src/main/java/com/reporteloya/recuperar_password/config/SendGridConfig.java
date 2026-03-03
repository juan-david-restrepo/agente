package com.reporteloya.recuperar_password.config;

import com.sendgrid.SendGrid;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SendGridConfig {

    @Bean
    public SendGrid sendGrid() {
        // Aquí pones tu clave API que creaste en SendGrid
        return new SendGrid("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");
    }
}