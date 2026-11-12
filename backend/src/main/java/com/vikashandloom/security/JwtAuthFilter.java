package com.vikashandloom.security;

import com.vikashandloom.model.AccessSession;
import com.vikashandloom.model.AppUser;
import com.vikashandloom.repo.SessionRepo;
import com.vikashandloom.repo.UserRepo;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Validates the JWT AND the server-side session + account state on every request,
 * so disabling/revoking/expiring an account takes effect immediately.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final SessionRepo sessions;
    private final UserRepo users;

    public JwtAuthFilter(JwtService jwt, SessionRepo sessions, UserRepo users) {
        this.jwt = jwt;
        this.sessions = sessions;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            Optional<Claims> claims = jwt.parse(h.substring(7));
            if (claims.isPresent()) {
                Instant now = Instant.now();
                Optional<AccessSession> s = sessions.findById(claims.get().getId());
                if (s.isPresent() && !s.get().isRevoked() && now.isBefore(s.get().getExpiresAt())) {
                    Optional<AppUser> u = users.findById(s.get().getUserId());
                    if (u.isPresent() && u.get().isUsableAt(now)) {
                        AuthUser principal = new AuthUser(u.get().getId(), u.get().getUsername(), u.get().getRole(), s.get().getId());
                        var auth = new UsernamePasswordAuthenticationToken(principal, null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + u.get().getRole().name())));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }
        }
        chain.doFilter(req, res);
    }
}