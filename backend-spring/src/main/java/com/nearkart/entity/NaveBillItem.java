package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "nave_bill_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NaveBillItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nave_bill_id", nullable = false)
    private UUID naveBillId;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "kharidar_name", nullable = false)
    private String kharidarName;

    @Column(name = "pauti_no")
    private String pautiNo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nave_bill_id", insertable = false, updatable = false)
    private NaveBill naveBill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @PrePersist
    protected void onCreate() { OffsetDateTime now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
