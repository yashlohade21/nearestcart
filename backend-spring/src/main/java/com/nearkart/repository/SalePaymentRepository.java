package com.nearkart.repository;

import com.nearkart.entity.SalePayment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SalePaymentRepository extends JpaRepository<SalePayment, UUID> {
    List<SalePayment> findByUserIdOrderByPaymentDateDesc(UUID userId, Pageable pageable);
    Optional<SalePayment> findByIdAndUserId(UUID id, UUID userId);
    List<SalePayment> findByUserIdAndBuyerId(UUID userId, UUID buyerId);
}
