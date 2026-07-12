package com.nearkart.dto.agent;

import com.nearkart.entity.AgentCommission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class AgentCommissionResponse {
    private UUID id; private UUID userId; private UUID companyId; private UUID agentId;
    private String billNo; private String supplierName; private String vehicleNo;
    private BigDecimal billTotal; private BigDecimal commissionPct; private BigDecimal commissionAmount;
    private LocalDate paymentDate; private Boolean paid;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;
    private String agentName;

    public static AgentCommissionResponse from(AgentCommission c) {
        return AgentCommissionResponse.builder()
                .id(c.getId()).userId(c.getUserId()).companyId(c.getCompanyId()).agentId(c.getAgentId())
                .billNo(c.getBillNo()).supplierName(c.getSupplierName()).vehicleNo(c.getVehicleNo())
                .billTotal(c.getBillTotal()).commissionPct(c.getCommissionPct())
                .commissionAmount(c.getCommissionAmount()).paymentDate(c.getPaymentDate()).paid(c.getPaid())
                .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt())
                .agentName(c.getAgent() != null ? c.getAgent().getName() : null).build();
    }
}
