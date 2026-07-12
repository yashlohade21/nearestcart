package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "advances")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Advance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "farmer_id", nullable = false)
    private UUID farmerId;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal recovered = BigDecimal.ZERO;

    private String purpose;

    @Column(name = "given_date")
    private LocalDate givenDate;

    @Column(name = "expected_recovery_date")
    private LocalDate expectedRecoveryDate;

    @Builder.Default
    private String status = "active";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", insertable = false, updatable = false)
    private Farmer farmer;

    @Transient
    public BigDecimal getBalance() {
        BigDecimal r = recovered != null ? recovered : BigDecimal.ZERO;
        return amount.subtract(r);
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (givenDate == null) givenDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
