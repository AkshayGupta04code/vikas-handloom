package com.vikashandloom.web;

import com.vikashandloom.security.AuthUser;
import com.vikashandloom.service.MediaService;
import com.vikashandloom.model.Role;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    private final MediaService media;
    public MediaController(MediaService media) { this.media = media; }

    /** Authenticated only. Customers always receive a downscaled watermarked copy; only admins may request the original. */
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> get(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean original,
                                      @AuthenticationPrincipal AuthUser me) throws IOException {
        var s = media.serve(id, original && me.role() == Role.ADMIN);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(s.contentType()))
                .cacheControl(CacheControl.noStore())
                .header("Content-Disposition", "inline; filename=\"image\"")
                .header("X-Content-Type-Options", "nosniff")
                .body(s.bytes());
    }
}