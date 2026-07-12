package com.nearkart.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @AllArgsConstructor
public class PendingPayments {
    private List<PendingPaymentSummary> fromBuyers;
    private List<PendingPaymentSummary> toFarmers;
    private BigDecimal totalFromBuyers;
    private BigDecimal totalToFarmers;
    private BigDecimal netPosition;
}
