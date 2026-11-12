package com.vikashandloom.web;

import com.vikashandloom.service.SettingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final SettingService settings;
    public PublicController(SettingService settings) { this.settings = settings; }

    @GetMapping("/settings") public Map<String, String> settings() { return settings.all(); }
}