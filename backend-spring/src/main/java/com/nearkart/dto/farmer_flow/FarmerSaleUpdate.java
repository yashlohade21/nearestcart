package com.nearkart.dto.farmer_flow;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FarmerSaleUpdate {
    private BigDecimal marketFees; private BigDecimal supervision; private BigDecimal adatCommission;
    private BigDecimal bardan; private BigDecimal labour; private BigDecimal sutli;
    private BigDecimal gadiBhada; private BigDecimal weightShort;
    private BigDecimal totalDeductions; private BigDecimal netPayable;
}
