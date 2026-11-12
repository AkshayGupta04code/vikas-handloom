package com.vikashandloom;

import com.vikashandloom.config.AppProps;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties(AppProps.class)
@EnableScheduling
public class VikasHandloomApplication {
    public static void main(String[] args) {
        SpringApplication.run(VikasHandloomApplication.class, args);
    }
}