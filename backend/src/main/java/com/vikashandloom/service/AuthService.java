package com.vikashandloom.service;

import com.vikashandloom.model.AccessSession;
import com.vikashandloom.model.AppUser;
import com.vikashandloom.model.Role;
import com.vikashandloom.repo.SessionRepo;
import com.vikashandloom.repo.UserRepo;
import com.vikashandloom.security.JwtService;
import com.vikashandloom.security.LoginLimiter;
import com.vikashandloom.web.ApiException;
import com.vikashandloom.web.Dtos.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {
    private final String dummyHash;
    private final UserRepo users;
    private final SessionRepo sessions;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LoginLimiter limiter;

    public AuthService(UserRepo users, SessionRepo sessions, PasswordEncoder encoder, JwtService jwt, LoginLimiter limiter) {
        this.dummyHash = encoder.encode("not-a-real-password"); this.users = users; this.sessions = sessions; this.encoder = encoder; this.jwt = jwt; this.limiter = limiter;
    }

    @Transactional
    public LoginResponse login(String username, String password, String ip) {
        String key = username.toLowerCase() + "|" + ip;
        if (limiter.blocked(key)) throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many failed attempts. Try again in 15 minutes.");
        AppUser u = users.findByUsername(username.trim()).orElse(null);
        boolean ok = encoder.matches(password, u != null ? u.getPasswordHash() : dummyHash) && u != null;
        if (!ok) {
            limiter.failure(key);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username or password.");
        }
        Instant now = Instant.now();
        // Start the usage window on first login (customers only) - re-logging in never extends it.
        if (u.getRole() == Role.CUSTOMER && u.getFirstLoginAt() == null && u.isEnabled()
                && (u.getActiveFrom() == null || !now.isBefore(u.getActiveFrom()))
                && (u.getExpiresAt() == null || now.isBefore(u.getExpiresAt()))) {
            u.setFirstLoginAt(now);
        }
        if (!u.isUsableAt(now)) {
            String s = u.statusAt(now);
            String msg = switch (s) {
                case "SCHEDULED" -> "Your access has not started yet. Please contact VIKAS HANDLOOM.";
                case "EXPIRED" -> "Your access period has ended. Please contact VIKAS HANDLOOM for new credentials.";
                default -> "This account has been disabled. Please contact VIKAS HANDLOOM.";
            };
            throw new ApiException(HttpStatus.FORBIDDEN, msg);
        }
        limiter.success(key);
        Instant exp = u.effectiveExpiry();
        Instant cap = now.plus(u.getRole() == Role.ADMIN ? 8 : 24, ChronoUnit.HOURS);
        if (exp == null || exp.isAfter(cap)) exp = cap;
        u.setLastLoginAt(now);
        users.save(u);
        AccessSession s = new AccessSession();
        s.setId(UUID.randomUUID().toString());
        s.setUserId(u.getId());
        s.setIssuedAt(now);
        s.setExpiresAt(exp);
        sessions.save(s);
        String token = jwt.issue(s.getId(), u.getUsername(), u.getRole().name(), exp);
        return new LoginResponse(token, u.getUsername(), u.getRole().name(), exp, now);
    }

    @Transactional
    public void logout(String sessionId) {
        sessions.findById(sessionId).ifPresent(s -> { s.setRevoked(true); sessions.save(s); });
    }

    @Scheduled(fixedDelay = 3_600_000)
    @Transactional
    public void purgeOldSessions() {
        sessions.deleteExpiredBefore(Instant.now().minus(1, ChronoUnit.DAYS));
    }
}