package com.nearkart.dto.nave_bill;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class NaveBillItemCreate {
    private UUID productId; private String kharidarName; private String pautiNo;
    private BigDecimal weight; private BigDecimal rate; private BigDecimal amount;
}
