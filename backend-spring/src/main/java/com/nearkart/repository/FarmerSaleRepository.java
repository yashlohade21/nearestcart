package com.nearkart.repository;

import com.nearkart.entity.FarmerSale;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmerSaleRepository extends JpaRepository<FarmerSale, UUID> {
    List<FarmerSale> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<FarmerSale> findByIdAndUserId(UUID id, UUID userId);
    Optional<FarmerSale> findByFarmerEntryId(UUID farmerEntryId);
}
