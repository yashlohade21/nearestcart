package com.nearkart.repository;

import com.nearkart.entity.Farmer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmerRepository extends JpaRepository<Farmer, UUID> {
    List<Farmer> findByUserIdOrderByNameAsc(UUID userId);
    List<Farmer> findByUserIdAndNameContainingIgnoreCase(UUID userId, String name, Pageable pageable);
    List<Farmer> findByUserId(UUID userId, Pageable pageable);
    Optional<Farmer> findByIdAndUserId(UUID id, UUID userId);
}
