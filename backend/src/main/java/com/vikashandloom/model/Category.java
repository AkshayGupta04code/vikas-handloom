package com.vikashandloom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter @Setter @NoArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String slug;
    @Column(nullable = false)
    private String name;
    /** HOME_FURNISHING or CLOTHING */
    @Column(name = "group_name", nullable = false)
    private String group;
    @Column(length = 500)
    private String description;
    private String accentColor = "#8b5e3c";
    private Long imageId;
    private int sortOrder;
}