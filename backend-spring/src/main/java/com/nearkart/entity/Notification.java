package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private String type = "info";

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = OffsetDateTime.now(); }
}
