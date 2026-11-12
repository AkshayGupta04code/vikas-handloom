package com.vikashandloom.security;

import com.vikashandloom.config.AppProps;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private final SecretKey key;

    public JwtService(AppProps props) {
        String secret = props.jwtSecret();
        if (secret == null || secret.isBlank()) {
            byte[] b = new byte[48];
            new SecureRandom().nextBytes(b);
            secret = Base64.getEncoder().encodeToString(b);
            log.warn("JWT_SECRET not set - generated a random one for this run. Set JWT_SECRET to keep sessions across restarts.");
        } else if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issue(String jti, String subject, String role, Instant expiresAt) {
        return Jwts.builder().id(jti).subject(subject).claim("role", role)
                .issuedAt(new Date()).expiration(Date.from(expiresAt)).signWith(key).compact();
    }

    /** Returns empty if the signature is wrong or the token is expired. */
    public Optional<Claims> parse(String token) {
        try {
            return Optional.of(Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}