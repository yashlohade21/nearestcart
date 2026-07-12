package com.nearkart.repository;

import com.nearkart.entity.FarmerEntry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmerEntryRepository extends JpaRepository<FarmerEntry, UUID> {
    List<FarmerEntry> findByUserIdOrderByEntryDateDesc(UUID userId, Pageable pageable);
    Optional<FarmerEntry> findByIdAndUserId(UUID id, UUID userId);
    List<FarmerEntry> findByUserIdAndFarmerId(UUID userId, UUID farmerId);
}
