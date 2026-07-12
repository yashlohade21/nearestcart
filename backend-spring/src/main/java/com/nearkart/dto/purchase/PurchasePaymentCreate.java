package com.nearkart.dto.purchase;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PurchasePaymentCreate {
    private UUID companyId; @NotNull private UUID supplierId; private LocalDate paymentDate;
    private String billNo; @NotNull private BigDecimal total; @NotNull private BigDecimal paid;
    @NotNull private BigDecimal balance; private String bankName; private String chequeNo;
    private String paymentMode; private String narration;
}
