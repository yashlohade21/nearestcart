package com.nearkart.dto.farmer_flow;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class FarmerEntryUpdate {
    private UUID companyId; private String invoiceNo; private LocalDate entryDate;
    private UUID farmerId; private String village; private UUID kharidarId;
    private UUID productId; private BigDecimal weight; private BigDecimal rate;
    private BigDecimal amount; private BigDecimal hamali; private BigDecimal tawali;
    private BigDecimal warai; private BigDecimal autoCharge; private BigDecimal kharcha; private String mobileNo;
}
