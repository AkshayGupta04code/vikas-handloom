package com.vikashandloom.web;

import com.vikashandloom.service.UserAdminService;
import com.vikashandloom.web.Dtos.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final UserAdminService svc;
    public AdminUserController(UserAdminService svc) { this.svc = svc; }

    @GetMapping public List<UserDto> list() { return svc.list(); }
    @PostMapping("/generate") public List<IssuedCredential> generate(@RequestBody GenerateRequest r) { return svc.generate(r); }
    @PutMapping("/{id}") public UserDto update(@PathVariable Long id, @RequestBody UpdateUserRequest r) { return svc.update(id, r); }
    @PostMapping("/{id}/revoke") public UserDto revoke(@PathVariable Long id) { return svc.revoke(id); }
    @PostMapping("/{id}/enable") public UserDto enable(@PathVariable Long id) { return svc.enable(id); }
    @PostMapping("/{id}/reset")
    public IssuedCredential reset(@PathVariable Long id, @RequestBody(required = false) ResetRequest r) {
        return svc.reset(id, r != null && Boolean.TRUE.equals(r.restartUsageWindow()));
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { svc.delete(id); return ResponseEntity.noContent().build(); }
}