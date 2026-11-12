package com.vikashandloom.security;

import com.vikashandloom.model.Role;

public record AuthUser(Long id, String username, Role role, String sessionId) {}