package com.vikashandloom.web;

import com.vikashandloom.repo.TemplateRepo;
import com.vikashandloom.service.CatalogService;
import com.vikashandloom.web.Dtos.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Read-only catalogue APIs - require a valid customer or admin session. */
@RestController
@RequestMapping("/api")
public class CatalogController {
    private final CatalogService catalog;
    private final TemplateRepo templates;

    public CatalogController(CatalogService catalog, TemplateRepo templates) { this.catalog = catalog; this.templates = templates; }

    @GetMapping("/categories") public List<CategoryDto> categories() { return catalog.categories(); }

    @GetMapping("/products")
    public ProductPage products(@RequestParam(required = false) String q, @RequestParam(required = false) String category,
                                @RequestParam(required = false) String group, @RequestParam(required = false) String color,
                                @RequestParam(required = false) String pattern, @RequestParam(required = false) String size,
                                @RequestParam(required = false) String design, @RequestParam(required = false) Boolean featured,
                                @RequestParam(required = false) Boolean newArrival, @RequestParam(required = false) Boolean popular,
                                @RequestParam(required = false) Boolean inStock, @RequestParam(required = false) String sort,
                                @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size_) {
        return catalog.search(q, category, group, color, pattern, size, design, featured, newArrival, popular, inStock, sort, page, size_);
    }

    @GetMapping("/products/{id}") public ProductDto product(@PathVariable Long id) { return catalog.get(id); }
    @GetMapping("/products/{id}/related") public List<ProductDto> related(@PathVariable Long id) { return catalog.related(id); }
    @GetMapping("/search/suggest") public List<Suggestion> suggest(@RequestParam String q) { return catalog.suggest(q); }
    @GetMapping("/filters") public Filters filters() { return catalog.filters(); }

    @GetMapping("/preview/templates")
    public List<TemplateDto> templates() { return templates.findByActiveTrueOrderByIdDesc().stream().map(TemplateDto::of).toList(); }
}