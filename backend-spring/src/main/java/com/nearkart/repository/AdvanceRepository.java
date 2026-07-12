package com.nearkart.repository;

import com.nearkart.entity.Advance;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdvanceRepository extends JpaRepository<Advance, UUID> {
    List<Advance> findByUserIdOrderByGivenDateDesc(UUID userId, Pageable pageable);
    Optional<Advance> findByIdAndUserId(UUID id, UUID userId);
    List<Advance> findByUserIdAndStatusIn(UUID userId, List<String> statuses);

    @Query("SELECT COALESCE(SUM(a.amount - a.recovered), 0) FROM Advance a WHERE a.userId = :userId AND a.status IN ('active', 'partial')")
    BigDecimal sumActiveAdvances(@Param("userId") UUID userId);
}
