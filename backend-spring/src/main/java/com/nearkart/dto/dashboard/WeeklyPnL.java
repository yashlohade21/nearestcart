package com.nearkart.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @AllArgsConstructor
public class WeeklyPnL {
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private long totalDeals;
    private BigDecimal totalBought;
    private BigDecimal totalSold;
    private BigDecimal grossMargin;
    private BigDecimal totalCosts;
    private BigDecimal netProfit;
    private BigDecimal totalSpoilageQty;
    private BigDecimal avgSpoilagePct;
}
