package com.nearkart.repository;

import com.nearkart.entity.PurchasePayment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PurchasePaymentRepository extends JpaRepository<PurchasePayment, UUID> {
    List<PurchasePayment> findByUserIdOrderByPaymentDateDesc(UUID userId, Pageable pageable);
    Optional<PurchasePayment> findByIdAndUserId(UUID id, UUID userId);
    List<PurchasePayment> findByUserIdAndSupplierId(UUID userId, UUID supplierId);
}
