package com.vikashandloom.web;

import com.vikashandloom.model.AccessSession;
import com.vikashandloom.repo.SessionRepo;
import com.vikashandloom.security.AuthUser;
import com.vikashandloom.service.AuthService;
import com.vikashandloom.web.Dtos.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final SessionRepo sessions;

    public AuthController(AuthService auth, SessionRepo sessions) { this.auth = auth; this.sessions = sessions; }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest r, HttpServletRequest req) {
        return auth.login(r.username(), r.password(), req.getRemoteAddr());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal AuthUser me) {
        auth.logout(me.sessionId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal AuthUser me) {
        AccessSession s = sessions.findById(me.sessionId()).orElseThrow();
        return new MeResponse(me.username(), me.role().name(), s.getExpiresAt(), Instant.now());
    }
}