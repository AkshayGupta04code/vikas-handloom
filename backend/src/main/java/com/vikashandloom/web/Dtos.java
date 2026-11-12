package com.vikashandloom.web;

import com.vikashandloom.model.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class Dtos {
    private Dtos() {}

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record LoginResponse(String token, String username, String role, Instant expiresAt, Instant serverTime) {}
    public record MeResponse(String username, String role, Instant expiresAt, Instant serverTime) {}

    public record VariantDto(String label, String colorHex, String size, BigDecimal price, int stock) {
        static VariantDto of(Variant v) { return new VariantDto(v.getLabel(), v.getColorHex(), v.getSize(), v.getPrice(), v.getStock()); }
    }

    public record ProductDto(Long id, String name, String description, BigDecimal price, Long categoryId, String categoryName,
                             String categorySlug, String color, String colorHex, String size, String pattern, String design,
                             int stock, boolean inStock, boolean featured, boolean newArrival, boolean popular, boolean demo,
                             List<Long> imageIds, List<VariantDto> variants) {
        public static ProductDto of(Product p) {
            Category c = p.getCategory();
            return new ProductDto(p.getId(), p.getName(), p.getDescription(), p.getPrice(), c.getId(), c.getName(), c.getSlug(),
                    p.getColor(), p.getColorHex(), p.getSize(), p.getPattern(), p.getDesign(), p.getStock(), p.getStock() > 0,
                    p.isFeatured(), p.isNewArrival(), p.isPopular(), p.isDemo(), List.copyOf(p.getImageIds()),
                    p.getVariants().stream().map(VariantDto::of).toList());
        }
    }

    public record ProductRequest(@NotBlank @Size(max = 200) String name, @Size(max = 2000) String description, BigDecimal price,
                                 @NotNull Long categoryId, String color, String colorHex, String size, String pattern, String design,
                                 int stock, boolean featured, boolean newArrival, boolean popular, boolean demo,
                                 List<Long> imageIds, List<VariantDto> variants) {}

    public record ProductPage(List<ProductDto> items, long total, int page, int pages) {}

    public record CategoryDto(Long id, String slug, String name, String group, String description, String accentColor,
                              Long imageId, int sortOrder, long productCount) {
        public static CategoryDto of(Category c, long count) {
            return new CategoryDto(c.getId(), c.getSlug(), c.getName(), c.getGroup(), c.getDescription(), c.getAccentColor(),
                    c.getImageId(), c.getSortOrder(), count);
        }
    }

    public record CategoryRequest(@NotBlank String name, @NotBlank String group, String description, String accentColor,
                                  Long imageId, int sortOrder) {}

    public record Filters(List<String> colors, List<String> patterns, List<String> sizes, List<String> designs) {}
    public record Suggestion(String type, String label, Long id, String slug) {}

    public record TemplateDto(Long id, String kind, String name, Long mediaId, String maskJson, boolean active) {
        public static TemplateDto of(PreviewTemplate t) {
            return new TemplateDto(t.getId(), t.getKind(), t.getName(), t.getMediaId(), t.getMaskJson(), t.isActive());
        }
    }
    public record TemplateRequest(@NotBlank String kind, @NotBlank String name, @NotNull Long mediaId, String maskJson, boolean active) {}

    public record GenerateRequest(String label, Integer count, Instant validFrom, Instant validUntil, Integer validDays,
                                  Integer usageMinutes) {}
    public record UpdateUserRequest(Instant activeFrom, Instant expiresAt, Integer usageMinutes, String note, Boolean enabled) {}
    public record ResetRequest(Boolean restartUsageWindow) {}

    public record UserDto(Long id, String username, String status, boolean enabled, Instant activeFrom, Instant expiresAt,
                          Instant effectiveExpiry, Integer usageMinutes, Instant firstLoginAt, Instant lastLoginAt,
                          String note, Instant createdAt, Long remainingSeconds) {
        public static UserDto of(AppUser u) {
            Instant now = Instant.now();
            Instant eff = u.effectiveExpiry();
            Long rem = eff == null ? null : Math.max(0, eff.getEpochSecond() - now.getEpochSecond());
            return new UserDto(u.getId(), u.getUsername(), u.statusAt(now), u.isEnabled(), u.getActiveFrom(), u.getExpiresAt(), eff,
                    u.getSessionMinutes(), u.getFirstLoginAt(), u.getLastLoginAt(), u.getNote(), u.getCreatedAt(), rem);
        }
    }
    /** Plain-text password is only ever returned once, at creation/reset time. */
    public record IssuedCredential(UserDto user, String username, String password) {}
}