package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "delivery_places")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DeliveryPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "place_name", nullable = false)
    private String placeName;

    private String district;
    private String state;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() { OffsetDateTime now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
