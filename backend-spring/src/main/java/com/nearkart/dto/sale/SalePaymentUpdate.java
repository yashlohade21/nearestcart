package com.nearkart.dto.sale;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class SalePaymentUpdate {
    private UUID companyId; private UUID buyerId; private LocalDate paymentDate;
    private String invoiceNo; private BigDecimal total; private BigDecimal received;
    private BigDecimal balance; private String bankName; private String chequeNo;
    private String paymentMode; private String narration;
}
