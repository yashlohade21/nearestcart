package com.nearkart.dto.farmer_flow;

import com.nearkart.entity.FarmerEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class FarmerEntryResponse {
    private UUID id; private UUID userId; private UUID companyId; private String invoiceNo;
    private LocalDate entryDate; private UUID farmerId; private String village;
    private UUID kharidarId; private UUID productId; private BigDecimal weight;
    private BigDecimal rate; private BigDecimal amount; private BigDecimal hamali;
    private BigDecimal tawali; private BigDecimal warai; private BigDecimal autoCharge;
    private BigDecimal kharcha; private String mobileNo;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;
    private String farmerName; private String productName; private String kharidarName;

    public static FarmerEntryResponse from(FarmerEntry e) {
        return FarmerEntryResponse.builder()
                .id(e.getId()).userId(e.getUserId()).companyId(e.getCompanyId()).invoiceNo(e.getInvoiceNo())
                .entryDate(e.getEntryDate()).farmerId(e.getFarmerId()).village(e.getVillage())
                .kharidarId(e.getKharidarId()).productId(e.getProductId()).weight(e.getWeight())
                .rate(e.getRate()).amount(e.getAmount()).hamali(e.getHamali()).tawali(e.getTawali())
                .warai(e.getWarai()).autoCharge(e.getAutoCharge()).kharcha(e.getKharcha()).mobileNo(e.getMobileNo())
                .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .farmerName(e.getFarmer() != null ? e.getFarmer().getName() : null)
                .productName(e.getProduct() != null ? e.getProduct().getName() : null)
                .kharidarName(e.getKharidar() != null ? e.getKharidar().getName() : null)
                .build();
    }
}
