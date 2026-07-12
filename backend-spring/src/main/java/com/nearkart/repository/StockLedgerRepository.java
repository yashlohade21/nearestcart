package com.nearkart.repository;

import com.nearkart.entity.StockLedger;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StockLedgerRepository extends JpaRepository<StockLedger, UUID> {
    List<StockLedger> findByUserIdOrderByTxnDateDesc(UUID userId, Pageable pageable);
    List<StockLedger> findByUserIdAndProductIdOrderByTxnDateDesc(UUID userId, UUID productId);
}
