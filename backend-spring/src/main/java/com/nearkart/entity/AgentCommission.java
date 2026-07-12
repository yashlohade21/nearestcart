package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "agent_commissions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AgentCommission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "agent_id", nullable = false)
    private UUID agentId;

    @Column(name = "bill_no")
    private String billNo;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "vehicle_no")
    private String vehicleNo;

    @Column(name = "bill_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal billTotal;

    @Column(name = "commission_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionPct;

    @Column(name = "commission_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal commissionAmount;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Builder.Default
    private Boolean paid = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", insertable = false, updatable = false)
    private Agent agent;

    @PrePersist
    protected void onCreate() { OffsetDateTime now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
