package com.vikashandloom.repo;

import com.vikashandloom.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepo extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    @Query("select p.category.id, count(p) from Product p group by p.category.id")
    List<Object[]> countByCategory();
    long countByCategoryId(Long categoryId);
    @Query("select distinct p.color from Product p where p.color is not null order by p.color")
    List<String> distinctColors();
    @Query("select distinct p.pattern from Product p where p.pattern is not null order by p.pattern")
    List<String> distinctPatterns();
    @Query("select distinct p.size from Product p where p.size is not null order by p.size")
    List<String> distinctSizes();
    @Query("select distinct p.design from Product p where p.design is not null order by p.design")
    List<String> distinctDesigns();
}