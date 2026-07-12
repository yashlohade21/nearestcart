package com.nearkart.repository;

import com.nearkart.entity.MandiRate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MandiRateRepository extends JpaRepository<MandiRate, UUID> {
    List<MandiRate> findByRateDateOrderByProductNameAsc(LocalDate rateDate);
    List<MandiRate> findByProductNameContainingIgnoreCaseAndRateDate(String productName, LocalDate rateDate);
    List<MandiRate> findByMandiNameAndRateDate(String mandiName, LocalDate rateDate, Pageable pageable);
}
