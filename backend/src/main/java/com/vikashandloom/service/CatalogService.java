package com.vikashandloom.service;

import com.vikashandloom.model.*;
import com.vikashandloom.repo.*;
import com.vikashandloom.web.ApiException;
import com.vikashandloom.web.Dtos.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CatalogService {
    private final ProductRepo products;
    private final CategoryRepo categories;

    public CatalogService(ProductRepo products, CategoryRepo categories) { this.products = products; this.categories = categories; }

    public List<CategoryDto> categories() {
        Map<Long, Long> counts = products.countByCategory().stream().collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));
        return categories.findAllByOrderBySortOrderAscNameAsc().stream()
                .map(c -> CategoryDto.of(c, counts.getOrDefault(c.getId(), 0L))).toList();
    }

    public ProductPage search(String q, String category, String group, String color, String pattern, String size, String design,
                              Boolean featured, Boolean newArrival, Boolean popular, Boolean inStock, String sort, int page, int pageSize) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            var cat = root.join("category");
            if (q != null && !q.isBlank()) {
                for (String term : q.trim().toLowerCase().split("\\s+")) {
                    String like = "%" + term.replace("%", "") + "%";
                    ps.add(cb.or(cb.like(cb.lower(root.get("name")), like), cb.like(cb.lower(cat.get("name")), like),
                            cb.like(cb.lower(root.get("color")), like), cb.like(cb.lower(root.get("pattern")), like),
                            cb.like(cb.lower(root.get("design")), like), cb.like(cb.lower(root.get("description")), like)));
                }
            }
            if (notBlank(category)) ps.add(cb.equal(cat.get("slug"), category));
            if (notBlank(group)) ps.add(cb.equal(cat.get("group"), group));
            if (notBlank(color)) ps.add(cb.equal(cb.lower(root.get("color")), color.toLowerCase()));
            if (notBlank(pattern)) ps.add(cb.equal(cb.lower(root.get("pattern")), pattern.toLowerCase()));
            if (notBlank(size)) ps.add(cb.equal(cb.lower(root.get("size")), size.toLowerCase()));
            if (notBlank(design)) ps.add(cb.equal(cb.lower(root.get("design")), design.toLowerCase()));
            if (Boolean.TRUE.equals(featured)) ps.add(cb.isTrue(root.get("featured")));
            if (Boolean.TRUE.equals(newArrival)) ps.add(cb.isTrue(root.get("newArrival")));
            if (Boolean.TRUE.equals(popular)) ps.add(cb.isTrue(root.get("popular")));
            if (Boolean.TRUE.equals(inStock)) ps.add(cb.greaterThan(root.get("stock"), 0));
            return cb.and(ps.toArray(new Predicate[0]));
        };
        Sort s = switch (sort == null ? "" : sort) {
            case "price_asc" -> Sort.by("price").ascending().and(Sort.by("id"));
            case "price_desc" -> Sort.by("price").descending().and(Sort.by("id"));
            case "name" -> Sort.by("name").ascending();
            default -> Sort.by("createdAt").descending().and(Sort.by("id").descending());
        };
        Page<Product> p = products.findAll(spec, PageRequest.of(Math.max(page, 0), Math.min(Math.max(pageSize, 1), 60), s));
        return new ProductPage(p.getContent().stream().map(ProductDto::of).toList(), p.getTotalElements(), p.getNumber(), p.getTotalPages());
    }

    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }

    public ProductDto get(Long id) {
        return ProductDto.of(products.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found")));
    }

    public List<ProductDto> related(Long id) {
        Product p = products.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        Specification<Product> spec = (r, q, cb) -> cb.and(cb.equal(r.get("category").get("id"), p.getCategory().getId()), cb.notEqual(r.get("id"), id));
        return products.findAll(spec, PageRequest.of(0, 4, Sort.by("id").descending())).stream().map(ProductDto::of).toList();
    }

    public List<Suggestion> suggest(String q) {
        if (q == null || q.trim().length() < 2) return List.of();
        String t = q.trim().toLowerCase();
        List<Suggestion> out = new ArrayList<>();
        categories.findAllByOrderBySortOrderAscNameAsc().stream().filter(c -> c.getName().toLowerCase().contains(t)).limit(3)
                .forEach(c -> out.add(new Suggestion("category", c.getName(), c.getId(), c.getSlug())));
        search(t, null, null, null, null, null, null, null, null, null, null, "name", 0, 6).items()
                .forEach(p -> out.add(new Suggestion("product", p.name(), p.id(), null)));
        return out;
    }

    public Filters filters() {
        return new Filters(products.distinctColors(), products.distinctPatterns(), products.distinctSizes(), products.distinctDesigns());
    }
}