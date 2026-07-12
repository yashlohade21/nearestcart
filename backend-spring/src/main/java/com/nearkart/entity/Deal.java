package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "deals")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "farmer_id")
    private UUID farmerId;

    @Column(name = "buyer_id")
    private UUID buyerId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Builder.Default
    private String unit = "kg";

    @Column(name = "buy_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal buyRate;

    @Column(name = "sell_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellRate;

    @Column(name = "transport_cost", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal transportCost = BigDecimal.ZERO;

    @Column(name = "labour_cost", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal labourCost = BigDecimal.ZERO;

    @Column(name = "other_cost", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal otherCost = BigDecimal.ZERO;

    @Builder.Default
    private String status = "pending";

    @Column(name = "farmer_payment_status")
    @Builder.Default
    private String farmerPaymentStatus = "unpaid";

    @Column(name = "buyer_payment_status")
    @Builder.Default
    private String buyerPaymentStatus = "unpaid";

    @Column(name = "farmer_paid_amount", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal farmerPaidAmount = BigDecimal.ZERO;

    @Column(name = "buyer_received_amount", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal buyerReceivedAmount = BigDecimal.ZERO;

    @Column(name = "spoilage_qty", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal spoilageQty = BigDecimal.ZERO;

    @Column(name = "spoilage_reason")
    private String spoilageReason;

    @Column(name = "transporter_id")
    private UUID transporterId;

    @Column(name = "deal_date")
    private LocalDate dealDate;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "payment_due_date")
    private LocalDate paymentDueDate;

    @Column(name = "quality_grade")
    private String qualityGrade;

    @Column(name = "has_dispute")
    @Builder.Default
    private Boolean hasDispute = false;

    @Column(name = "dispute_notes", columnDefinition = "TEXT")
    private String disputeNotes;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Computed properties (DB generated columns - read-only)
    @Column(name = "buy_total", insertable = false, updatable = false)
    private BigDecimal buyTotal;

    @Column(name = "sell_total", insertable = false, updatable = false)
    private BigDecimal sellTotal;

    @Column(name = "gross_margin", insertable = false, updatable = false)
    private BigDecimal grossMargin;

    @Column(name = "total_cost", insertable = false, updatable = false)
    private BigDecimal totalCost;

    @Column(name = "net_profit", insertable = false, updatable = false)
    private BigDecimal netProfit;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", insertable = false, updatable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", insertable = false, updatable = false)
    private Buyer buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transporter_id", insertable = false, updatable = false)
    private Transporter transporter;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (dealDate == null) dealDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // Transient computed fields for when DB generated columns aren't available
    @Transient
    public BigDecimal computeBuyTotal() {
        return quantity != null && buyRate != null ? quantity.multiply(buyRate) : BigDecimal.ZERO;
    }

    @Transient
    public BigDecimal computeSellTotal() {
        return quantity != null && sellRate != null ? quantity.multiply(sellRate) : BigDecimal.ZERO;
    }

    @Transient
    public BigDecimal computeGrossMargin() {
        return computeSellTotal().subtract(computeBuyTotal());
    }

    @Transient
    public BigDecimal computeTotalCost() {
        BigDecimal t = transportCost != null ? transportCost : BigDecimal.ZERO;
        BigDecimal l = labourCost != null ? labourCost : BigDecimal.ZERO;
        BigDecimal o = otherCost != null ? otherCost : BigDecimal.ZERO;
        return t.add(l).add(o);
    }

    @Transient
    public BigDecimal computeNetProfit() {
        return computeGrossMargin().subtract(computeTotalCost());
    }
}
