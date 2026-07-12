package com.nearkart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "photos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "deal_id", nullable = false)
    private UUID dealId;

    @Column(name = "photo_type")
    private String photoType;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @Column(name = "s3_url")
    private String s3Url;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "captured_at")
    private OffsetDateTime capturedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deal_id", insertable = false, updatable = false)
    private Deal deal;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        if (capturedAt == null) capturedAt = OffsetDateTime.now();
    }
}
