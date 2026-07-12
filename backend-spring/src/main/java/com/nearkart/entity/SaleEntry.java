package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sale_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SaleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "invoice_no", nullable = false)
    private String invoiceNo;

    @Column(name = "sale_date")
    private LocalDate saleDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rate;

    @Column(name = "gross_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "transport_cost", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal transportCost = BigDecimal.ZERO;

    @Column(name = "lr_no")
    private String lrNo;

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "vehicle_no")
    private String vehicleNo;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "hsn_code")
    private String hsnCode;

    @Column(name = "tcs_amount", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal tcsAmount = BigDecimal.ZERO;

    @Column(name = "add_topay", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal addTopay = BigDecimal.ZERO;

    @Column(name = "less_topay", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal lessTopay = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "po_no")
    private String poNo;

    private String branch;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", insertable = false, updatable = false)
    private Buyer buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (saleDate == null) saleDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
