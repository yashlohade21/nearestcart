package com.nearkart.repository;

import com.nearkart.entity.FarmerPayment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmerPaymentRepository extends JpaRepository<FarmerPayment, UUID> {
    List<FarmerPayment> findByUserIdOrderByPaymentDateDesc(UUID userId, Pageable pageable);
    Optional<FarmerPayment> findByIdAndUserId(UUID id, UUID userId);
    List<FarmerPayment> findByUserIdAndFarmerId(UUID userId, UUID farmerId);

    @Query("SELECT COALESCE(SUM(fp.amount), 0) FROM FarmerPayment fp WHERE fp.userId = :userId AND fp.farmerId = :farmerId")
    BigDecimal sumPaymentsByFarmer(@Param("userId") UUID userId, @Param("farmerId") UUID farmerId);
}
