package com.nearkart.repository;

import com.nearkart.entity.CashEntry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CashEntryRepository extends JpaRepository<CashEntry, UUID> {
    List<CashEntry> findByUserIdOrderByEntryDateDesc(UUID userId, Pageable pageable);
    Optional<CashEntry> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COALESCE(SUM(CASE WHEN c.type = 'receipt' THEN c.amount ELSE -c.amount END), 0) FROM CashEntry c WHERE c.userId = :userId")
    BigDecimal computeCashBalance(@Param("userId") UUID userId);
}
