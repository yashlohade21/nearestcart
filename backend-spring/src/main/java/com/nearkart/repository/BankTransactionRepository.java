package com.nearkart.repository;

import com.nearkart.entity.BankTransaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, UUID> {
    List<BankTransaction> findByUserIdOrderByTxnDateDesc(UUID userId, Pageable pageable);
    Optional<BankTransaction> findByIdAndUserId(UUID id, UUID userId);
}
