package com.nearkart.repository;

import com.nearkart.entity.Kharidar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KharidarRepository extends JpaRepository<Kharidar, UUID> {
    List<Kharidar> findByUserIdOrderByNameAsc(UUID userId);
    Optional<Kharidar> findByIdAndUserId(UUID id, UUID userId);
}
