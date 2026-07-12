package com.nearkart.repository;

import com.nearkart.entity.NaveBillDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface NaveBillDetailRepository extends JpaRepository<NaveBillDetail, UUID> {
    Optional<NaveBillDetail> findByNaveBillId(UUID naveBillId);
}
