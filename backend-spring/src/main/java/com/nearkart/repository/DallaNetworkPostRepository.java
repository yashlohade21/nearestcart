package com.nearkart.repository;

import com.nearkart.entity.DallaNetworkPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DallaNetworkPostRepository extends JpaRepository<DallaNetworkPost, UUID> {
    List<DallaNetworkPost> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<DallaNetworkPost> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
