package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "nave_bills")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NaveBill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "bill_no", nullable = false)
    private String billNo;

    @Column(name = "bill_date")
    private LocalDate billDate;

    @Column(name = "total_amount", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "net_amount", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal netAmount = BigDecimal.ZERO;

    @Builder.Default
    private String status = "draft";

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", insertable = false, updatable = false)
    private Buyer buyer;

    @OneToMany(mappedBy = "naveBill", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<NaveBillItem> items = new ArrayList<>();

    @OneToOne(mappedBy = "naveBill", cascade = CascadeType.ALL, orphanRemoval = true)
    private NaveBillDetail details;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (billDate == null) billDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
