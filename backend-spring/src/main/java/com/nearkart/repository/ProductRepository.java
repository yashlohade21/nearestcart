package com.nearkart.repository;

import com.nearkart.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByUserIdOrderByNameAsc(UUID userId);
    List<Product> findByUserIdAndNameContainingIgnoreCase(UUID userId, String name, Pageable pageable);
    List<Product> findByUserId(UUID userId, Pageable pageable);
    Optional<Product> findByIdAndUserId(UUID id, UUID userId);
}
