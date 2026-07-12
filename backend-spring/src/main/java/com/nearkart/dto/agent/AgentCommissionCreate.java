package com.nearkart.dto.agent;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AgentCommissionCreate {
    private UUID companyId; @NotNull private UUID agentId; private String billNo;
    private String supplierName; private String vehicleNo;
    @NotNull private BigDecimal billTotal; @NotNull private BigDecimal commissionPct;
    @NotNull private BigDecimal commissionAmount; private LocalDate paymentDate; private Boolean paid;
}
