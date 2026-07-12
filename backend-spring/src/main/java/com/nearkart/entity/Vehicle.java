package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "vehicle_no", nullable = false)
    private String vehicleNo;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "driver_name")
    private String driverName;

    private String phone;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() { OffsetDateTime now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
