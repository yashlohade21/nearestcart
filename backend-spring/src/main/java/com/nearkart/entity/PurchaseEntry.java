package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "purchase_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PurchaseEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "agent_id")
    private UUID agentId;

    @Column(name = "bill_no", nullable = false)
    private String billNo;

    @Column(name = "p_date")
    private LocalDate pDate;

    @Column(name = "vehicle_no")
    private String vehicleNo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rate;

    @Column(name = "gross_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "transport_cost", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal transportCost = BigDecimal.ZERO;

    @Column(name = "loading_cost", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal loadingCost = BigDecimal.ZERO;

    @Column(name = "unloading_cost", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal unloadingCost = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal advance = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "commission_deduction", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal commissionDeduction = BigDecimal.ZERO;

    private String branch;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", insertable = false, updatable = false)
    private Farmer supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", insertable = false, updatable = false)
    private Agent agent;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (pDate == null) pDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
