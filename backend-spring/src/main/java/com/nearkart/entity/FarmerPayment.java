package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "farmer_payment_records")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FarmerPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "farmer_id", nullable = false)
    private UUID farmerId;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "cash_amount", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal cashAmount = BigDecimal.ZERO;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "cheque_no")
    private String chequeNo;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", insertable = false, updatable = false)
    private Farmer farmer;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (paymentDate == null) paymentDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
