package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "gst_no")
    private String gstNo;

    @Column(name = "pan_no")
    private String panNo;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    private String phone;
    private String email;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_no")
    private String accountNo;

    @Column(name = "ifsc_code")
    private String ifscCode;

    private String branch;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() { OffsetDateTime now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
