package com.vikashandloom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "media_files")
@Getter @Setter @NoArgsConstructor
public class MediaFile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String originalName;
    @Column(nullable = false)
    private String storedName;
    private String contentType;
    private Instant createdAt = Instant.now();
}