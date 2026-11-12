package com.vikashandloom.repo;

import com.vikashandloom.model.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepo extends JpaRepository<MediaFile, Long> {}