package com.nearkart.dto.farmer_flow;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class FarmerPaymentCreate {
    private UUID companyId; @NotNull private UUID farmerId; private LocalDate paymentDate;
    @NotNull private BigDecimal amount; private BigDecimal cashAmount;
    private String bankName; private String chequeNo; private String narration;
}
