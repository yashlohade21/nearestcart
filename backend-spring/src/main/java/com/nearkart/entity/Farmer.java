package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "farmers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String email;
    private String village;
    private String district;
    private String state;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "opening_balance", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name = "credit_days")
    @Builder.Default
    private Integer creditDays = 0;

    @Column(name = "primary_crops", columnDefinition = "TEXT[]")
    private String[] primaryCrops;

    @Column(name = "quality_rating", precision = 2, scale = 1)
    private BigDecimal qualityRating;

    @Column(precision = 5, scale = 2)
    private BigDecimal reliability;

    @Column(name = "total_deals")
    @Builder.Default
    private Integer totalDeals = 0;

    @Column(name = "total_volume_kg", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalVolumeKg = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

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
