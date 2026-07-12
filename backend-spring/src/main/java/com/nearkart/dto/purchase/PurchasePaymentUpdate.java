package com.nearkart.dto.purchase;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PurchasePaymentUpdate {
    private UUID companyId; private UUID supplierId; private LocalDate paymentDate;
    private String billNo; private BigDecimal total; private BigDecimal paid;
    private BigDecimal balance; private String bankName; private String chequeNo;
    private String paymentMode; private String narration;
}
