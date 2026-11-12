package com.vikashandloom.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProps(String jwtSecret, String adminUsername, String adminPassword, String uploadDir,
                       String corsOrigins, boolean seedDemoData, String watermarkText) {
}