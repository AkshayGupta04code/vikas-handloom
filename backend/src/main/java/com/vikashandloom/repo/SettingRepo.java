package com.vikashandloom.repo;

import com.vikashandloom.model.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingRepo extends JpaRepository<SiteSetting, String> {}