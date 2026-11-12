package com.vikashandloom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "site_settings")
@Getter @Setter @NoArgsConstructor
public class SiteSetting {
    @Id @Column(name = "setting_key")
    private String key;
    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;
}