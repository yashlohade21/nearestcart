package com.nearkart.repository;

import com.nearkart.entity.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, UUID entityId);
}
