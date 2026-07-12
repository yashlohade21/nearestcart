package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cash_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CashEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "entry_date")
    private LocalDate entryDate;

    @Column(nullable = false)
    private String type; // receipt/payment

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "party_name")
    private String partyName;

    @Column(name = "party_type")
    private String partyType;

    @Column(name = "reference_no")
    private String referenceNo;

    private String branch;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now; updatedAt = now;
        if (entryDate == null) entryDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
