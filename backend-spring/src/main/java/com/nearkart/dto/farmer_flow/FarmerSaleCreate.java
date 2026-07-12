package com.nearkart.dto.farmer_flow;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class FarmerSaleCreate {
    private UUID companyId; @NotNull private UUID farmerEntryId;
    private BigDecimal marketFees; private BigDecimal supervision; private BigDecimal adatCommission;
    private BigDecimal bardan; private BigDecimal labour; private BigDecimal sutli;
    private BigDecimal gadiBhada; private BigDecimal weightShort;
    private BigDecimal totalDeductions; private BigDecimal netPayable;
}
