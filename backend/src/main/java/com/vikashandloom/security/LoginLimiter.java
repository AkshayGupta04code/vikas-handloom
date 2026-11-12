package com.vikashandloom.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/** Simple in-memory brute-force guard: 8 failures per 15 minutes per username+IP. */
@Component
public class LoginLimiter {
    private static final int MAX = 8;
    private static final long WINDOW = 15 * 60;
    private final ConcurrentHashMap<String, Deque<Instant>> fails = new ConcurrentHashMap<>();

    public boolean blocked(String key) {
        Deque<Instant> d = fails.get(key);
        if (d == null) return false;
        synchronized (d) {
            Instant cutoff = Instant.now().minusSeconds(WINDOW);
            while (!d.isEmpty() && d.peekFirst().isBefore(cutoff)) d.pollFirst();
            return d.size() >= MAX;
        }
    }

    public void failure(String key) {
        Deque<Instant> d = fails.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (d) { d.addLast(Instant.now()); }
    }

    public void success(String key) { fails.remove(key); }
}