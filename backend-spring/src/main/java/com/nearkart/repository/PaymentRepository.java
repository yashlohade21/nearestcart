package com.nearkart.repository;

import com.nearkart.entity.Payment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByUserIdOrderByPaymentDateDesc(UUID userId, Pageable pageable);
    List<Payment> findByUserIdAndDirectionOrderByPaymentDateDesc(UUID userId, String direction, Pageable pageable);
    List<Payment> findByUserIdAndDealId(UUID userId, UUID dealId);
    List<Payment> findByUserIdAndFarmerId(UUID userId, UUID farmerId);
    List<Payment> findByUserIdAndBuyerId(UUID userId, UUID buyerId);
}
