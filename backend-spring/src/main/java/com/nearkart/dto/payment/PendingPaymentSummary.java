package com.nearkart.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class PendingPaymentSummary {
    private UUID partyId;
    private String partyName;
    private String partyPhone;
    private BigDecimal pendingAmount;
    private int pendingDeals;
    private LocalDate oldestDealDate;
    private int maxOverdueDays;
}
