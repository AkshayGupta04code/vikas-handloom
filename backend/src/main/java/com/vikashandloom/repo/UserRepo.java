package com.vikashandloom.repo;

import com.vikashandloom.model.AppUser;
import com.vikashandloom.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByRole(Role role);
    List<AppUser> findByRoleOrderByCreatedAtDesc(Role role);
}