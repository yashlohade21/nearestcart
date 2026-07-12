package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bank_accounts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "account_holder_name")
    private String accountHolderName;

    @Column(name = "account_no")
    private String accountNo;

    @Column(name = "account_type")
    @Builder.Default
    private String accountType = "current";

    @Column(name = "ifsc_code")
    private String ifscCode;

    private String branch;

    @Column(name = "opening_balance", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name = "current_balance", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() { OffsetDateTime now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
