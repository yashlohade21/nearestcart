package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "expense_date")
    private LocalDate expenseDate;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_mode")
    private String paymentMode;

    @Column(name = "bank_account_id")
    private UUID bankAccountId;

    @Column(name = "cheque_no")
    private String chequeNo;

    @Column(name = "party_name")
    private String partyName;

    @Column(name = "farmer_bill_ref")
    private String farmerBillRef;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (expenseDate == null) expenseDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
