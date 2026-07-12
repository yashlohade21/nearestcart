package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "dalla_network_posts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DallaNetworkPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = OffsetDateTime.now(); }
}
