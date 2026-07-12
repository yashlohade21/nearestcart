package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bank_transactions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BankTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "bank_account_id", nullable = false)
    private UUID bankAccountId;

    @Column(name = "txn_date")
    private LocalDate txnDate;

    @Column(nullable = false)
    private String type; // deposit/withdrawal/transfer

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "party_name")
    private String partyName;

    @Column(name = "cheque_no")
    private String chequeNo;

    @Column(name = "cheque_date")
    private LocalDate chequeDate;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Builder.Default
    private Boolean reconciled = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", insertable = false, updatable = false)
    private BankAccount bankAccount;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (txnDate == null) txnDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
