package com.vikashandloom.service;

import com.vikashandloom.model.*;
import com.vikashandloom.repo.*;
import com.vikashandloom.web.ApiException;
import com.vikashandloom.web.Dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AdminCatalogService {
    private final ProductRepo products;
    private final CategoryRepo categories;
    private final TemplateRepo templates;

    public AdminCatalogService(ProductRepo products, CategoryRepo categories, TemplateRepo templates) {
        this.products = products; this.categories = categories; this.templates = templates;
    }

    // ---- products ----
    public ProductDto createProduct(ProductRequest r) { return ProductDto.of(products.save(apply(new Product(), r))); }

    public ProductDto updateProduct(Long id, ProductRequest r) {
        Product p = products.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        return ProductDto.of(products.save(apply(p, r)));
    }

    public void deleteProduct(Long id) {
        if (!products.existsById(id)) throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        products.deleteById(id);
    }

    private Product apply(Product p, ProductRequest r) {
        Category c = categories.findById(r.categoryId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown category"));
        if (r.price() != null && r.price().signum() < 0) throw new ApiException(HttpStatus.BAD_REQUEST, "Price cannot be negative");
        if (r.stock() < 0) throw new ApiException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        p.setName(r.name().trim()); p.setDescription(r.description()); p.setPrice(r.price()); p.setCategory(c);
        p.setColor(blank(r.color())); p.setColorHex(blank(r.colorHex())); p.setSize(blank(r.size()));
        p.setPattern(blank(r.pattern())); p.setDesign(blank(r.design()));
        p.setStock(r.stock()); p.setFeatured(r.featured()); p.setNewArrival(r.newArrival()); p.setPopular(r.popular()); p.setDemo(r.demo());
        p.getImageIds().clear();
        if (r.imageIds() != null) p.getImageIds().addAll(r.imageIds());
        p.getVariants().clear();
        if (r.variants() != null) for (VariantDto v : r.variants()) {
            Variant x = new Variant();
            x.setLabel(v.label()); x.setColorHex(v.colorHex()); x.setSize(v.size()); x.setPrice(v.price()); x.setStock(Math.max(0, v.stock()));
            p.getVariants().add(x);
        }
        return p;
    }

    private static String blank(String s) { return s == null || s.isBlank() ? null : s.trim(); }

    // ---- categories ----
    public CategoryDto createCategory(CategoryRequest r) {
        Category c = new Category();
        c.setSlug(uniqueSlug(r.name(), null));
        return save(c, r);
    }

    public CategoryDto updateCategory(Long id, CategoryRequest r) {
        Category c = categories.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));
        return save(c, r);
    }

    private CategoryDto save(Category c, CategoryRequest r) {
        if (!List.of("HOME_FURNISHING", "CLOTHING").contains(r.group())) throw new ApiException(HttpStatus.BAD_REQUEST, "group must be HOME_FURNISHING or CLOTHING");
        c.setName(r.name().trim()); c.setGroup(r.group()); c.setDescription(r.description());
        if (r.accentColor() != null && !r.accentColor().isBlank()) c.setAccentColor(r.accentColor());
        c.setImageId(r.imageId()); c.setSortOrder(r.sortOrder());
        c = categories.save(c);
        return CategoryDto.of(c, products.countByCategoryId(c.getId()));
    }

    public void deleteCategory(Long id) {
        if (products.countByCategoryId(id) > 0) throw new ApiException(HttpStatus.CONFLICT, "Move or delete this category's products first");
        categories.deleteById(id);
    }

    public static String slugify(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return n.isEmpty() ? "category" : n;
    }

    private String uniqueSlug(String name, Long selfId) {
        String base = slugify(name), s = base;
        for (int i = 2; categories.findBySlug(s).isPresent(); i++) s = base + "-" + i;
        return s;
    }

    // ---- preview templates ----
    public List<TemplateDto> allTemplates() { return new ArrayList<>(templates.findAll().stream().map(TemplateDto::of).toList()); }

    public TemplateDto saveTemplate(Long id, TemplateRequest r) {
        PreviewTemplate t = id == null ? new PreviewTemplate()
                : templates.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));
        t.setKind(r.kind()); t.setName(r.name()); t.setMediaId(r.mediaId()); t.setMaskJson(r.maskJson()); t.setActive(r.active());
        return TemplateDto.of(templates.save(t));
    }

    public void deleteTemplate(Long id) { templates.deleteById(id); }
}