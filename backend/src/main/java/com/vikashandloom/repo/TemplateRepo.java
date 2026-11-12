package com.vikashandloom.repo;

import com.vikashandloom.model.PreviewTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateRepo extends JpaRepository<PreviewTemplate, Long> {
    List<PreviewTemplate> findByActiveTrueOrderByIdDesc();
}