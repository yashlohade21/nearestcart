package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "farmer_sales")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FarmerSale {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "farmer_entry_id", nullable = false)
    private UUID farmerEntryId;

    @Column(name = "market_fees", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal marketFees = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal supervision = BigDecimal.ZERO;

    @Column(name = "adat_commission", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal adatCommission = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal bardan = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal labour = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal sutli = BigDecimal.ZERO;

    @Column(name = "gadi_bhada", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal gadiBhada = BigDecimal.ZERO;

    @Column(name = "weight_short", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal weightShort = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "net_payable", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal netPayable = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_entry_id", insertable = false, updatable = false)
    private FarmerEntry farmerEntry;

    @PrePersist
    protected void onCreate() { OffsetDateTime now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
