package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "mandi_rates")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MandiRate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "mandi_name", nullable = false)
    private String mandiName;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(name = "min_price", precision = 10, scale = 2)
    private BigDecimal minPrice;

    @Column(name = "max_price", precision = 10, scale = 2)
    private BigDecimal maxPrice;

    @Column(name = "modal_price", precision = 10, scale = 2)
    private BigDecimal modalPrice;

    @Builder.Default
    private String unit = "quintal";

    @Column(name = "rate_date", nullable = false)
    private LocalDate rateDate;

    @Builder.Default
    private String source = "enam";

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = OffsetDateTime.now(); }
}
