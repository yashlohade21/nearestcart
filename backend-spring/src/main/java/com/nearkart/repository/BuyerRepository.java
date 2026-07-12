package com.nearkart.repository;

import com.nearkart.entity.Buyer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BuyerRepository extends JpaRepository<Buyer, UUID> {
    List<Buyer> findByUserIdOrderByNameAsc(UUID userId);
    List<Buyer> findByUserIdAndNameContainingIgnoreCase(UUID userId, String name, Pageable pageable);
    List<Buyer> findByUserId(UUID userId, Pageable pageable);
    Optional<Buyer> findByIdAndUserId(UUID id, UUID userId);
}
