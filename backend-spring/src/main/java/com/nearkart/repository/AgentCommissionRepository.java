package com.nearkart.repository;

import com.nearkart.entity.AgentCommission;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgentCommissionRepository extends JpaRepository<AgentCommission, UUID> {
    List<AgentCommission> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<AgentCommission> findByIdAndUserId(UUID id, UUID userId);
    List<AgentCommission> findByUserIdAndAgentId(UUID userId, UUID agentId);
}
