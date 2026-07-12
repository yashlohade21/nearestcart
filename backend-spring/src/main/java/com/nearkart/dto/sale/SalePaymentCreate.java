package com.nearkart.dto.sale;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class SalePaymentCreate {
    private UUID companyId; @NotNull private UUID buyerId; private LocalDate paymentDate;
    private String invoiceNo; @NotNull private BigDecimal total; @NotNull private BigDecimal received;
    @NotNull private BigDecimal balance; private String bankName; private String chequeNo;
    private String paymentMode; private String narration;
}
