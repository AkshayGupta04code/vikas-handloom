package com.vikashandloom.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Embeddable
@Getter @Setter @NoArgsConstructor
public class Variant {
    private String label;
    private String colorHex;
    private String size;
    private BigDecimal price;
    private int stock;
}