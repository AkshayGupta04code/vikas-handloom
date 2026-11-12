package com.vikashandloom.repo;

import com.vikashandloom.model.AccessSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;

public interface SessionRepo extends JpaRepository<AccessSession, String> {
    @Modifying @Query("update AccessSession s set s.revoked = true where s.userId = :userId and s.revoked = false")
    int revokeAllForUser(Long userId);

    @Modifying @Query("delete from AccessSession s where s.expiresAt < :cutoff")
    int deleteExpiredBefore(Instant cutoff);

    @Modifying @Query("delete from AccessSession s where s.userId = :userId")
    int deleteAllForUser(Long userId);
}