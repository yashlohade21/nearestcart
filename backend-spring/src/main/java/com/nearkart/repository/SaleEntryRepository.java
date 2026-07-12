package com.nearkart.repository;

import com.nearkart.entity.SaleEntry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SaleEntryRepository extends JpaRepository<SaleEntry, UUID> {
    List<SaleEntry> findByUserIdOrderBySaleDateDesc(UUID userId, Pageable pageable);
    Optional<SaleEntry> findByIdAndUserId(UUID id, UUID userId);
    List<SaleEntry> findByUserIdAndBuyerId(UUID userId, UUID buyerId);
}
