package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "buyers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Buyer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "contact_person")
    private String contactPerson;

    private String phone;
    private String email;

    @Column(name = "company_type")
    private String companyType;

    private String city;
    private String state;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "opening_balance", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name = "credit_limit", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(name = "credit_days")
    @Builder.Default
    private Integer creditDays = 0;

    @Column(name = "avg_payment_days", precision = 5, scale = 1)
    private BigDecimal avgPaymentDays;

    @Column(name = "dispute_rate", precision = 5, scale = 2)
    private BigDecimal disputeRate;

    @Column(name = "payment_rating", precision = 2, scale = 1)
    private BigDecimal paymentRating;

    @Column(name = "total_deals")
    @Builder.Default
    private Integer totalDeals = 0;

    @Column(name = "total_volume_kg", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalVolumeKg = BigDecimal.ZERO;

    @Column(name = "total_business_amt", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalBusinessAmt = BigDecimal.ZERO;

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
