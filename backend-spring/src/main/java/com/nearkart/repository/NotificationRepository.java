package com.nearkart.repository;

import com.nearkart.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    long countByUserIdAndIsReadFalse(UUID userId);
}
