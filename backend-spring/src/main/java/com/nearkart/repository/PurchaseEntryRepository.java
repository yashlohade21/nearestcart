package com.nearkart.repository;

import com.nearkart.entity.PurchaseEntry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PurchaseEntryRepository extends JpaRepository<PurchaseEntry, UUID> {
    @Query("SELECT p FROM PurchaseEntry p WHERE p.userId = :userId ORDER BY p.pDate DESC")
    List<PurchaseEntry> findByUserIdOrderByPDateDesc(UUID userId, Pageable pageable);
    Optional<PurchaseEntry> findByIdAndUserId(UUID id, UUID userId);
    List<PurchaseEntry> findByUserIdAndSupplierId(UUID userId, UUID supplierId);
}
