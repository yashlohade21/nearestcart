package com.nearkart.repository;

import com.nearkart.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BankAccountRepository extends JpaRepository<BankAccount, UUID> {
    List<BankAccount> findByUserIdOrderByBankNameAsc(UUID userId);
    Optional<BankAccount> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COALESCE(SUM(b.currentBalance), 0) FROM BankAccount b WHERE b.userId = :userId AND b.isActive = true")
    BigDecimal sumActiveBalances(@Param("userId") UUID userId);
}
