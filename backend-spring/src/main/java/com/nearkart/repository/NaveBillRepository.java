package com.nearkart.repository;

import com.nearkart.entity.NaveBill;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NaveBillRepository extends JpaRepository<NaveBill, UUID> {
    List<NaveBill> findByUserIdOrderByBillDateDesc(UUID userId, Pageable pageable);
    Optional<NaveBill> findByIdAndUserId(UUID id, UUID userId);
}
