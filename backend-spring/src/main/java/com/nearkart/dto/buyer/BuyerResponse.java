package com.nearkart.dto.buyer;

import com.nearkart.entity.Buyer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class BuyerResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String companyType;
    private String city;
    private String state;
    private String address;
    private String gstNumber;
    private String panNumber;
    private BigDecimal openingBalance;
    private BigDecimal creditLimit;
    private Integer creditDays;
    private BigDecimal avgPaymentDays;
    private BigDecimal disputeRate;
    private BigDecimal paymentRating;
    private Integer totalDeals;
    private BigDecimal totalVolumeKg;
    private BigDecimal totalBusinessAmt;
    private String notes;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static BuyerResponse from(Buyer b) {
        return BuyerResponse.builder()
                .id(b.getId()).userId(b.getUserId()).name(b.getName()).contactPerson(b.getContactPerson())
                .phone(b.getPhone()).email(b.getEmail()).companyType(b.getCompanyType()).city(b.getCity())
                .state(b.getState()).address(b.getAddress()).gstNumber(b.getGstNumber()).panNumber(b.getPanNumber())
                .openingBalance(b.getOpeningBalance()).creditLimit(b.getCreditLimit()).creditDays(b.getCreditDays())
                .avgPaymentDays(b.getAvgPaymentDays()).disputeRate(b.getDisputeRate()).paymentRating(b.getPaymentRating())
                .totalDeals(b.getTotalDeals()).totalVolumeKg(b.getTotalVolumeKg()).totalBusinessAmt(b.getTotalBusinessAmt())
                .notes(b.getNotes()).isActive(b.getIsActive()).createdAt(b.getCreatedAt()).updatedAt(b.getUpdatedAt())
                .build();
    }
}
