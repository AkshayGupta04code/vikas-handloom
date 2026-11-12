package com.vikashandloom.service;

import com.vikashandloom.model.AppUser;
import com.vikashandloom.model.Role;
import com.vikashandloom.repo.SessionRepo;
import com.vikashandloom.repo.UserRepo;
import com.vikashandloom.web.ApiException;
import com.vikashandloom.web.Dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserAdminService {
    // Unambiguous characters only (no 0/O, 1/l/I) so shop staff can read credentials aloud.
    private static final String ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom rnd = new SecureRandom();
    private final UserRepo users;
    private final SessionRepo sessions;
    private final PasswordEncoder encoder;

    public UserAdminService(UserRepo users, SessionRepo sessions, PasswordEncoder encoder) {
        this.users = users; this.sessions = sessions; this.encoder = encoder;
    }

    private String random(int n) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(ALPHABET.charAt(rnd.nextInt(ALPHABET.length())));
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public List<UserDto> list() {
        return users.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER).stream().map(UserDto::of).toList();
    }

    @Transactional
    public List<IssuedCredential> generate(GenerateRequest r) {
        int count = r.count() == null ? 1 : r.count();
        if (count < 1 || count > 50) throw new ApiException(HttpStatus.BAD_REQUEST, "count must be 1-50");
        Instant from = r.validFrom() == null ? Instant.now() : r.validFrom();
        Instant until = r.validUntil() != null ? r.validUntil()
                : from.plus(r.validDays() == null ? 7 : r.validDays(), ChronoUnit.DAYS);
        if (!until.isAfter(from)) throw new ApiException(HttpStatus.BAD_REQUEST, "Expiry must be after the start date");
        if (r.usageMinutes() != null && r.usageMinutes() < 1) throw new ApiException(HttpStatus.BAD_REQUEST, "usageMinutes must be positive");
        List<IssuedCredential> out = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String username;
            do { username = "vh-" + random(6).toLowerCase(); } while (users.existsByUsername(username));
            String password = random(10);
            AppUser u = new AppUser();
            u.setUsername(username);
            u.setPasswordHash(encoder.encode(password));
            u.setRole(Role.CUSTOMER);
            u.setActiveFrom(from);
            u.setExpiresAt(until);
            u.setSessionMinutes(r.usageMinutes());
            u.setNote(r.label());
            users.save(u);
            out.add(new IssuedCredential(UserDto.of(u), username, password));
        }
        return out;
    }

    private AppUser customer(Long id) {
        AppUser u = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (u.getRole() != Role.CUSTOMER) throw new ApiException(HttpStatus.FORBIDDEN, "Only customer accounts can be managed here");
        return u;
    }

    @Transactional
    public UserDto update(Long id, UpdateUserRequest r) {
        AppUser u = customer(id);
        if (r.activeFrom() != null) u.setActiveFrom(r.activeFrom());
        if (r.expiresAt() != null) u.setExpiresAt(r.expiresAt());
        if (r.usageMinutes() != null) u.setSessionMinutes(r.usageMinutes() <= 0 ? null : r.usageMinutes());
        if (r.note() != null) u.setNote(r.note());
        if (r.enabled() != null) {
            u.setEnabled(r.enabled());
            if (!r.enabled()) sessions.revokeAllForUser(u.getId());
        }
        return UserDto.of(users.save(u));
    }

    /** Disables the account and kills every live session immediately. */
    @Transactional
    public UserDto revoke(Long id) {
        AppUser u = customer(id);
        u.setEnabled(false);
        sessions.revokeAllForUser(u.getId());
        return UserDto.of(users.save(u));
    }

    @Transactional
    public UserDto enable(Long id) {
        AppUser u = customer(id);
        u.setEnabled(true);
        return UserDto.of(users.save(u));
    }

    @Transactional
    public IssuedCredential reset(Long id, boolean restartUsage) {
        AppUser u = customer(id);
        String password = random(10);
        u.setPasswordHash(encoder.encode(password));
        if (restartUsage) u.setFirstLoginAt(null);
        sessions.revokeAllForUser(u.getId());
        users.save(u);
        return new IssuedCredential(UserDto.of(u), u.getUsername(), password);
    }

    @Transactional
    public void delete(Long id) {
        AppUser u = customer(id);
        sessions.deleteAllForUser(u.getId());
        users.delete(u);
    }
}