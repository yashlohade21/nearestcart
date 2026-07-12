package com.nearkart.dto.nave_bill;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class NaveBillCreate {
    private UUID companyId; @NotNull private String billNo; private LocalDate billDate;
    @NotNull private UUID buyerId; private BigDecimal totalAmount;
    private BigDecimal totalDeductions; private BigDecimal netAmount; private String status;
    private List<NaveBillItemCreate> items;
    private NaveBillDetailCreate details;
}
