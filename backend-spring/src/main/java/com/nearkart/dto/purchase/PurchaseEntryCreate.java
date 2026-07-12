package com.nearkart.dto.purchase;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PurchaseEntryCreate {
    private UUID companyId; @NotNull private String billNo; private LocalDate pDate;
    @NotNull private UUID supplierId; private String vehicleNo; @NotNull private UUID productId;
    private UUID agentId; @NotNull private BigDecimal quantity; @NotNull private BigDecimal rate;
    @NotNull private BigDecimal grossAmount; private BigDecimal transportCost; private BigDecimal loadingCost;
    private BigDecimal unloadingCost; private BigDecimal advance; @NotNull private BigDecimal netAmount;
    private BigDecimal commissionDeduction; private String branch; private String notes;
}
