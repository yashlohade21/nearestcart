package com.nearkart.repository;

import com.nearkart.entity.Deal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DealRepository extends JpaRepository<Deal, UUID> {
    List<Deal> findByUserIdOrderByDealDateDescCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<Deal> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COUNT(d) FROM Deal d WHERE d.userId = :userId AND d.dealDate = :date")
    long countByUserIdAndDealDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(d.quantity * d.buyRate), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate = :date")
    BigDecimal sumBuyTotalByDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(d.quantity * d.sellRate), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate = :date")
    BigDecimal sumSellTotalByDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(d.quantity * (d.sellRate - d.buyRate) - d.transportCost - d.labourCost - d.otherCost), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate = :date")
    BigDecimal sumNetProfitByDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(d.quantity * d.sellRate - d.buyerReceivedAmount), 0) FROM Deal d WHERE d.userId = :userId AND d.buyerPaymentStatus != 'paid'")
    BigDecimal sumPendingFromBuyers(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(d.quantity * d.buyRate - d.farmerPaidAmount), 0) FROM Deal d WHERE d.userId = :userId AND d.farmerPaymentStatus != 'paid'")
    BigDecimal sumPendingToFarmers(@Param("userId") UUID userId);

    // Weekly P&L
    @Query("SELECT COUNT(d) FROM Deal d WHERE d.userId = :userId AND d.dealDate BETWEEN :start AND :end")
    long countByUserIdAndDealDateBetween(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(d.quantity * d.buyRate), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate BETWEEN :start AND :end")
    BigDecimal sumBuyTotalBetween(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(d.quantity * d.sellRate), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate BETWEEN :start AND :end")
    BigDecimal sumSellTotalBetween(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(d.quantity * (d.sellRate - d.buyRate)), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate BETWEEN :start AND :end")
    BigDecimal sumGrossMarginBetween(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(d.transportCost + d.labourCost + d.otherCost), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate BETWEEN :start AND :end")
    BigDecimal sumCostsBetween(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(d.quantity * (d.sellRate - d.buyRate) - d.transportCost - d.labourCost - d.otherCost), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate BETWEEN :start AND :end")
    BigDecimal sumNetProfitBetween(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(d.spoilageQty), 0) FROM Deal d WHERE d.userId = :userId AND d.dealDate BETWEEN :start AND :end")
    BigDecimal sumSpoilageQtyBetween(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    List<Deal> findByUserIdAndFarmerId(UUID userId, UUID farmerId);
    List<Deal> findByUserIdAndBuyerId(UUID userId, UUID buyerId);
}
