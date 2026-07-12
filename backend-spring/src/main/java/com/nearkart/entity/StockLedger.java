package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_ledger")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StockLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "txn_date")
    private LocalDate txnDate;

    @Column(name = "txn_type", nullable = false)
    private String txnType; // purchase/sale/return/loss

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "balance_after", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (txnDate == null) txnDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
