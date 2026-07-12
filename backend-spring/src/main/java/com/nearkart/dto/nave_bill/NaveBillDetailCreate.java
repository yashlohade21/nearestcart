package com.nearkart.dto.nave_bill;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class NaveBillDetailCreate {
    private BigDecimal marketFees; private BigDecimal supervision; private BigDecimal adat;
    private BigDecimal bardan; private BigDecimal labour; private BigDecimal gadiBhada;
    private BigDecimal sutli; private BigDecimal weightShort;
}
