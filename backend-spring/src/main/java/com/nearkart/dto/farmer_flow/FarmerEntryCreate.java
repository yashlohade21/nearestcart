package com.nearkart.dto.farmer_flow;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class FarmerEntryCreate {
    private UUID companyId; @NotNull private String invoiceNo; private LocalDate entryDate;
    @NotNull private UUID farmerId; @NotNull private String village; private UUID kharidarId;
    @NotNull private UUID productId; @NotNull private BigDecimal weight; @NotNull private BigDecimal rate;
    @NotNull private BigDecimal amount; private BigDecimal hamali; private BigDecimal tawali;
    private BigDecimal warai; private BigDecimal autoCharge; private BigDecimal kharcha; private String mobileNo;
}
