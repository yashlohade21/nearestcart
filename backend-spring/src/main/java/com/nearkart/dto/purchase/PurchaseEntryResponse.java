package com.nearkart.dto.purchase;

import com.nearkart.entity.PurchaseEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class PurchaseEntryResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID supplierId;
    private UUID productId; private UUID agentId; private String billNo; private LocalDate pDate;
    private String vehicleNo; private BigDecimal quantity; private BigDecimal rate;
    private BigDecimal grossAmount; private BigDecimal transportCost; private BigDecimal loadingCost;
    private BigDecimal unloadingCost; private BigDecimal advance; private BigDecimal netAmount;
    private BigDecimal commissionDeduction; private String branch; private String notes;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static PurchaseEntryResponse from(PurchaseEntry p) {
        return PurchaseEntryResponse.builder()
                .id(p.getId()).userId(p.getUserId()).companyId(p.getCompanyId()).supplierId(p.getSupplierId())
                .productId(p.getProductId()).agentId(p.getAgentId()).billNo(p.getBillNo()).pDate(p.getPDate())
                .vehicleNo(p.getVehicleNo()).quantity(p.getQuantity()).rate(p.getRate())
                .grossAmount(p.getGrossAmount()).transportCost(p.getTransportCost()).loadingCost(p.getLoadingCost())
                .unloadingCost(p.getUnloadingCost()).advance(p.getAdvance()).netAmount(p.getNetAmount())
                .commissionDeduction(p.getCommissionDeduction()).branch(p.getBranch()).notes(p.getNotes())
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt()).build();
    }
}
