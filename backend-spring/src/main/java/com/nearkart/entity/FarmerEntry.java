package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "farmer_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FarmerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "invoice_no", nullable = false)
    private String invoiceNo;

    @Column(name = "entry_date")
    private LocalDate entryDate;

    @Column(name = "farmer_id", nullable = false)
    private UUID farmerId;

    @Column(nullable = false)
    private String village;

    @Column(name = "kharidar_id")
    private UUID kharidarId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal hamali = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal tawali = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal warai = BigDecimal.ZERO;

    @Column(name = "auto_charge", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal autoCharge = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal kharcha = BigDecimal.ZERO;

    @Column(name = "mobile_no")
    private String mobileNo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", insertable = false, updatable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kharidar_id", insertable = false, updatable = false)
    private Kharidar kharidar;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (entryDate == null) entryDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
