package com.vikashandloom.web;

import com.vikashandloom.model.MediaFile;
import com.vikashandloom.service.AdminCatalogService;
import com.vikashandloom.service.MediaService;
import com.vikashandloom.service.SettingService;
import com.vikashandloom.web.Dtos.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminCatalogController {
    private final AdminCatalogService svc;
    private final MediaService media;
    private final SettingService settings;

    public AdminCatalogController(AdminCatalogService svc, MediaService media, SettingService settings) {
        this.svc = svc; this.media = media; this.settings = settings;
    }

    @PostMapping("/products") public ProductDto createProduct(@Valid @RequestBody ProductRequest r) { return svc.createProduct(r); }
    @PutMapping("/products/{id}") public ProductDto updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest r) { return svc.updateProduct(id, r); }
    @DeleteMapping("/products/{id}") public ResponseEntity<Void> deleteProduct(@PathVariable Long id) { svc.deleteProduct(id); return ResponseEntity.noContent().build(); }

    @PostMapping("/categories") public CategoryDto createCategory(@Valid @RequestBody CategoryRequest r) { return svc.createCategory(r); }
    @PutMapping("/categories/{id}") public CategoryDto updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest r) { return svc.updateCategory(id, r); }
    @DeleteMapping("/categories/{id}") public ResponseEntity<Void> deleteCategory(@PathVariable Long id) { svc.deleteCategory(id); return ResponseEntity.noContent().build(); }

    @PostMapping("/media")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) throws IOException {
        MediaFile m = media.store(file);
        return Map.of("id", m.getId(), "name", m.getOriginalName());
    }

    @GetMapping("/templates") public List<TemplateDto> templates() { return svc.allTemplates(); }
    @PostMapping("/templates") public TemplateDto createTemplate(@Valid @RequestBody TemplateRequest r) { return svc.saveTemplate(null, r); }
    @PutMapping("/templates/{id}") public TemplateDto updateTemplate(@PathVariable Long id, @Valid @RequestBody TemplateRequest r) { return svc.saveTemplate(id, r); }
    @DeleteMapping("/templates/{id}") public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) { svc.deleteTemplate(id); return ResponseEntity.noContent().build(); }

    @PutMapping("/settings") public Map<String, String> updateSettings(@RequestBody Map<String, String> in) { return settings.update(in); }
}