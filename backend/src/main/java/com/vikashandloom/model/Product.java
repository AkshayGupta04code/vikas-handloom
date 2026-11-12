package com.vikashandloom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(length = 2000)
    private String description;
    /** null means price on request (no invented prices for demo items). */
    private BigDecimal price;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Category category;
    private String color;
    private String colorHex;
    @Column(name = "size_label")
    private String size;
    private String pattern;
    private String design;
    private int stock;
    private boolean featured;
    private boolean newArrival;
    private boolean popular;
    private boolean demo;
    private Instant createdAt = Instant.now();

    @ElementCollection @OrderColumn
    private List<Long> imageIds = new ArrayList<>();
    @ElementCollection @OrderColumn
    private List<Variant> variants = new ArrayList<>();
}