package com.nearkart.dto.nave_bill;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class NaveBillUpdate {
    private UUID companyId; private String billNo; private LocalDate billDate;
    private UUID buyerId; private BigDecimal totalAmount;
    private BigDecimal totalDeductions; private BigDecimal netAmount; private String status;
}
