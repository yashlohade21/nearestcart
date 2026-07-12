package com.nearkart.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PaymentCreate {
    private UUID dealId;
    private UUID advanceId;
    @NotNull private String direction; // incoming/outgoing
    private UUID farmerId;
    private UUID buyerId;
    @NotNull private BigDecimal amount;
    private String paymentMode;
    private String referenceNo;
    private LocalDate paymentDate;
    private String notes;
}
