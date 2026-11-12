package com.vikashandloom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** Server-side session record; the JWT jti points here so revocation is immediate. */
@Entity
@Table(name = "access_sessions", indexes = @Index(columnList = "userId"))
@Getter @Setter @NoArgsConstructor
public class AccessSession {
    @Id @Column(length = 64)
    private String id;
    private Long userId;
    private Instant issuedAt;
    private Instant expiresAt;
    private boolean revoked;
}