package com.milkessentials.api.catalog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        select p
        from Product p
        where p.available = true
          and (:categoryId is null or p.category.id = :categoryId)
          and (:search = '' or
               lower(p.name) like lower(concat('%', :search, '%')) or
               lower(p.sku) like lower(concat('%', :search, '%')))
        """)
    Page<Product> searchAvailable(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            Pageable pageable);

    Optional<Product> findByIdAndAvailableTrue(Long id);
}
