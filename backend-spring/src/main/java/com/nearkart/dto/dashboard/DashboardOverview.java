package com.nearkart.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder @AllArgsConstructor
public class DashboardOverview {
    private long todayDeals;
    private BigDecimal todayBuyTotal;
    private BigDecimal todaySellTotal;
    private BigDecimal todayNetProfit;
    private BigDecimal pendingFromBuyers;
    private BigDecimal pendingToFarmers;
    private BigDecimal netPosition;
    private BigDecimal activeAdvances;
    private BigDecimal cashBalance;
    private BigDecimal totalBankBalance;
}
