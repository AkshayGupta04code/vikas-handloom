package com.vikashandloom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Admin-managed room photo + mask regions (JSON polygons, normalised 0..1) for the virtual showroom. */
@Entity
@Table(name = "preview_templates")
@Getter @Setter @NoArgsConstructor
public class PreviewTemplate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    /** bed | sofa | curtain | cushion | carpet | comforter | table | other */
    private String kind;
    private String name;
    private Long mediaId;
    @Column(columnDefinition = "TEXT")
    private String maskJson;
    private boolean active = true;
}