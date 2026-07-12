package com.nearkart.dto.farmer_flow;

import com.nearkart.entity.FarmerSale;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class FarmerSaleResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID farmerEntryId;
    private BigDecimal marketFees; private BigDecimal supervision; private BigDecimal adatCommission;
    private BigDecimal bardan; private BigDecimal labour; private BigDecimal sutli;
    private BigDecimal gadiBhada; private BigDecimal weightShort;
    private BigDecimal totalDeductions; private BigDecimal netPayable;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static FarmerSaleResponse from(FarmerSale s) {
        return FarmerSaleResponse.builder()
                .id(s.getId()).userId(s.getUserId()).companyId(s.getCompanyId())
                .farmerEntryId(s.getFarmerEntryId()).marketFees(s.getMarketFees())
                .supervision(s.getSupervision()).adatCommission(s.getAdatCommission())
                .bardan(s.getBardan()).labour(s.getLabour()).sutli(s.getSutli())
                .gadiBhada(s.getGadiBhada()).weightShort(s.getWeightShort())
                .totalDeductions(s.getTotalDeductions()).netPayable(s.getNetPayable())
                .createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt()).build();
    }
}
