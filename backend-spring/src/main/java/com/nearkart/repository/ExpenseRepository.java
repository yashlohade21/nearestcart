package com.nearkart.repository;

import com.nearkart.entity.Expense;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findByUserIdOrderByExpenseDateDesc(UUID userId, Pageable pageable);
    Optional<Expense> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.userId = :userId")
    BigDecimal sumTotalExpenses(@Param("userId") UUID userId);
}
