package com.nearkart.dto.sale;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class SaleEntryCreate {
    private UUID companyId; @NotNull private String invoiceNo; private LocalDate saleDate;
    @NotNull private UUID buyerId; @NotNull private UUID productId;
    @NotNull private BigDecimal quantity; @NotNull private BigDecimal rate;
    @NotNull private BigDecimal grossAmount; private BigDecimal transportCost;
    private String lrNo; private String driverName; private String vehicleNo;
    private String ownerName; private String hsnCode; private BigDecimal tcsAmount;
    private BigDecimal addTopay; private BigDecimal lessTopay; @NotNull private BigDecimal netAmount;
    private String poNo; private String branch;
}
