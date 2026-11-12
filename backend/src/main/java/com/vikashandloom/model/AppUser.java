package com.vikashandloom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "app_users")
@Getter @Setter @NoArgsConstructor
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 64)
    private String username;
    @Column(nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Role role;
    private boolean enabled = true;
    /** Account becomes usable at this instant (null = immediately). */
    private Instant activeFrom;
    /** Account stops working at this instant (null = never; used for ADMIN only). */
    private Instant expiresAt;
    /** Allowed usage window in minutes, counted from the first login (null = until expiresAt). */
    private Integer sessionMinutes;
    @Column(length = 255)
    private String note;
    private Instant createdAt = Instant.now();
    private Instant lastLoginAt;
    /** Start of the usage window; set on first successful login. */
    private Instant firstLoginAt;

    /** The earlier of the absolute expiry and (first login + usage minutes). */
    public Instant effectiveExpiry() {
        Instant e = expiresAt;
        if (firstLoginAt != null && sessionMinutes != null) {
            Instant w = firstLoginAt.plusSeconds(sessionMinutes * 60L);
            if (e == null || w.isBefore(e)) e = w;
        }
        return e;
    }

    public boolean isUsableAt(Instant now) {
        if (!enabled) return false;
        if (activeFrom != null && now.isBefore(activeFrom)) return false;
        Instant e = effectiveExpiry();
        return e == null || now.isBefore(e);
    }

    public String statusAt(Instant now) {
        if (!enabled) return "DISABLED";
        if (activeFrom != null && now.isBefore(activeFrom)) return "SCHEDULED";
        Instant e = effectiveExpiry();
        if (e != null && !now.isBefore(e)) return "EXPIRED";
        return "ACTIVE";
    }
}