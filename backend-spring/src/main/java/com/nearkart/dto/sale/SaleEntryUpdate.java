package com.nearkart.dto.sale;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class SaleEntryUpdate {
    private UUID companyId; private String invoiceNo; private LocalDate saleDate;
    private UUID buyerId; private UUID productId; private BigDecimal quantity; private BigDecimal rate;
    private BigDecimal grossAmount; private BigDecimal transportCost;
    private String lrNo; private String driverName; private String vehicleNo;
    private String ownerName; private String hsnCode; private BigDecimal tcsAmount;
    private BigDecimal addTopay; private BigDecimal lessTopay; private BigDecimal netAmount;
    private String poNo; private String branch;
}
