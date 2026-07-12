package com.nearkart.dto.purchase;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PurchaseEntryUpdate {
    private UUID companyId; private String billNo; private LocalDate pDate;
    private UUID supplierId; private String vehicleNo; private UUID productId;
    private UUID agentId; private BigDecimal quantity; private BigDecimal rate;
    private BigDecimal grossAmount; private BigDecimal transportCost; private BigDecimal loadingCost;
    private BigDecimal unloadingCost; private BigDecimal advance; private BigDecimal netAmount;
    private BigDecimal commissionDeduction; private String branch; private String notes;
}
