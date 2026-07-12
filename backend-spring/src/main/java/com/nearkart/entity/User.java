package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String phone;

    @Column(nullable = false)
    private String name;

    @Column(name = "business_name")
    private String businessName;

    private String city;
    private String state;

    @Column(name = "mandi_name")
    private String mandiName;

    @Column(nullable = false)
    @Builder.Default
    private String language = "hi";

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "upi_id")
    private String upiId;

    @Column(nullable = false)
    @Builder.Default
    private String role = "owner";

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "fcm_token")
    private String fcmToken;

    @Column(nullable = false)
    @Builder.Default
    private String plan = "free";

    @Column(name = "plan_expires_at")
    private OffsetDateTime planExpiresAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
