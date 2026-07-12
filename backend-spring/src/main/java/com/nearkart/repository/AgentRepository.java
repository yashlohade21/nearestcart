package com.nearkart.repository;

import com.nearkart.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgentRepository extends JpaRepository<Agent, UUID> {
    List<Agent> findByUserIdOrderByNameAsc(UUID userId);
    Optional<Agent> findByIdAndUserId(UUID id, UUID userId);
}
