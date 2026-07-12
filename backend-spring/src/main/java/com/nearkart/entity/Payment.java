package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "deal_id")
    private UUID dealId;

    @Column(name = "advance_id")
    private UUID advanceId;

    @Column(nullable = false)
    private String direction; // incoming/outgoing

    @Column(name = "farmer_id")
    private UUID farmerId;

    @Column(name = "buyer_id")
    private UUID buyerId;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_mode")
    private String paymentMode;

    @Column(name = "reference_no")
    private String referenceNo;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deal_id", insertable = false, updatable = false)
    private Deal deal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advance_id", insertable = false, updatable = false)
    private Advance advance;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        if (paymentDate == null) paymentDate = LocalDate.now();
    }
}
