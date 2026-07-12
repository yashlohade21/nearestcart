package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sale_payments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SalePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "invoice_no")
    private String invoiceNo;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal received;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal balance;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "cheque_no")
    private String chequeNo;

    @Column(name = "payment_mode")
    @Builder.Default
    private String paymentMode = "cash";

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", insertable = false, updatable = false)
    private Buyer buyer;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (paymentDate == null) paymentDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
