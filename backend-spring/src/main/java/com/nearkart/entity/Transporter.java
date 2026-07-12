package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "transporters")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Transporter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    private String phone;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "vehicle_number")
    private String vehicleNumber;

    @Column(name = "base_city")
    private String baseCity;

    @Column(name = "avg_cost_per_km", precision = 8, scale = 2)
    private BigDecimal avgCostPerKm;

    @Column(name = "avg_spoilage_pct", precision = 5, scale = 2)
    private BigDecimal avgSpoilagePct;

    @Column(name = "on_time_pct", precision = 5, scale = 2)
    private BigDecimal onTimePct;

    @Column(name = "total_trips")
    @Builder.Default
    private Integer totalTrips = 0;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
