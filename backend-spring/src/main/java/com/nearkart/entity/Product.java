package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "name_local")
    private String nameLocal;

    private String category;

    @Builder.Default
    private String unit = "kg";

    @Column(name = "hsn_code")
    private String hsnCode;

    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "selling_price", precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "min_stock", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minStock = BigDecimal.ZERO;

    @Column(name = "current_stock", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "is_perishable")
    @Builder.Default
    private Boolean isPerishable = true;

    @Column(name = "avg_spoilage_pct", precision = 5, scale = 2)
    private BigDecimal avgSpoilagePct;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
