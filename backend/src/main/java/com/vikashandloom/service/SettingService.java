package com.vikashandloom.service;

import com.vikashandloom.model.SiteSetting;
import com.vikashandloom.repo.SettingRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettingService {
    /** Only these keys are editable; shop timings are intentionally empty until the owner fills them in. */
    public static final List<String> KEYS = List.of("shopTimings", "announcement", "aboutText", "watermarkEnabled");
    private final SettingRepo repo;
    public SettingService(SettingRepo repo) { this.repo = repo; }

    @Transactional(readOnly = true)
    public Map<String, String> all() {
        Map<String, String> m = new LinkedHashMap<>();
        KEYS.forEach(k -> m.put(k, ""));
        repo.findAll().forEach(s -> { if (KEYS.contains(s.getKey())) m.put(s.getKey(), s.getValue() == null ? "" : s.getValue()); });
        return m;
    }

    @Transactional
    public Map<String, String> update(Map<String, String> in) {
        in.forEach((k, v) -> {
            if (!KEYS.contains(k)) return;
            SiteSetting s = new SiteSetting();
            s.setKey(k);
            s.setValue(v == null ? "" : v.substring(0, Math.min(v.length(), 4000)));
            repo.save(s);
        });
        return all();
    }
}