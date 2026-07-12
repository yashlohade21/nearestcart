package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "nave_bill_details")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NaveBillDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nave_bill_id", nullable = false, unique = true)
    private UUID naveBillId;

    @Column(name = "market_fees", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal marketFees = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal supervision = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal adat = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal bardan = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal labour = BigDecimal.ZERO;

    @Column(name = "gadi_bhada", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal gadiBhada = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal sutli = BigDecimal.ZERO;

    @Column(name = "weight_short", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal weightShort = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nave_bill_id", insertable = false, updatable = false)
    private NaveBill naveBill;

    @PrePersist
    protected void onCreate() { OffsetDateTime now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
