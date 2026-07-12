package com.nearkart.dto.farmer;

import com.nearkart.entity.Farmer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class FarmerResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private String phone;
    private String email;
    private String village;
    private String district;
    private String state;
    private String address;
    private String panNumber;
    private BigDecimal openingBalance;
    private Integer creditDays;
    private String[] primaryCrops;
    private BigDecimal qualityRating;
    private BigDecimal reliability;
    private Integer totalDeals;
    private BigDecimal totalVolumeKg;
    private String notes;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static FarmerResponse from(Farmer f) {
        return FarmerResponse.builder()
                .id(f.getId()).userId(f.getUserId()).name(f.getName()).phone(f.getPhone())
                .email(f.getEmail()).village(f.getVillage()).district(f.getDistrict()).state(f.getState())
                .address(f.getAddress()).panNumber(f.getPanNumber()).openingBalance(f.getOpeningBalance())
                .creditDays(f.getCreditDays()).primaryCrops(f.getPrimaryCrops()).qualityRating(f.getQualityRating())
                .reliability(f.getReliability()).totalDeals(f.getTotalDeals()).totalVolumeKg(f.getTotalVolumeKg())
                .notes(f.getNotes())
                .isActive(f.getIsActive()).createdAt(f.getCreatedAt()).updatedAt(f.getUpdatedAt())
                .build();
    }
}
