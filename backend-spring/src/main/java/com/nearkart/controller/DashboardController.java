package com.nearkart.controller;

import com.nearkart.dto.dashboard.*;
import com.nearkart.dto.payment.PendingPayments;
import com.nearkart.repository.*;
import com.nearkart.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DealRepository dealRepository;
    private final AdvanceRepository advanceRepository;
    private final CashEntryRepository cashEntryRepository;
    private final BankAccountRepository bankAccountRepository;

    public DashboardController(DealRepository dealRepository, AdvanceRepository advanceRepository,
                                CashEntryRepository cashEntryRepository, BankAccountRepository bankAccountRepository) {
        this.dealRepository = dealRepository;
        this.advanceRepository = advanceRepository;
        this.cashEntryRepository = cashEntryRepository;
        this.bankAccountRepository = bankAccountRepository;
    }

    @GetMapping("/overview")
    public DashboardOverview overview(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        LocalDate today = LocalDate.now();
        BigDecimal pendingFrom = dealRepository.sumPendingFromBuyers(userId);
        BigDecimal pendingTo = dealRepository.sumPendingToFarmers(userId);
        return DashboardOverview.builder()
                .todayDeals(dealRepository.countByUserIdAndDealDate(userId, today))
                .todayBuyTotal(dealRepository.sumBuyTotalByDate(userId, today))
                .todaySellTotal(dealRepository.sumSellTotalByDate(userId, today))
                .todayNetProfit(dealRepository.sumNetProfitByDate(userId, today))
                .pendingFromBuyers(pendingFrom)
                .pendingToFarmers(pendingTo)
                .netPosition(pendingFrom.subtract(pendingTo))
                .activeAdvances(advanceRepository.sumActiveAdvances(userId))
                .cashBalance(cashEntryRepository.computeCashBalance(userId))
                .totalBankBalance(bankAccountRepository.sumActiveBalances(userId))
                .build();
    }

    @GetMapping("/weekly")
    public WeeklyPnL weekly(@RequestParam(required = false) String startDate,
                             @RequestParam(required = false) String endDate,
                             @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : end.with(DayOfWeek.MONDAY);
        long totalDeals = dealRepository.countByUserIdAndDealDateBetween(userId, start, end);
        BigDecimal totalBought = dealRepository.sumBuyTotalBetween(userId, start, end);
        BigDecimal totalSold = dealRepository.sumSellTotalBetween(userId, start, end);
        BigDecimal grossMargin = dealRepository.sumGrossMarginBetween(userId, start, end);
        BigDecimal totalCosts = dealRepository.sumCostsBetween(userId, start, end);
        BigDecimal netProfit = dealRepository.sumNetProfitBetween(userId, start, end);
        BigDecimal totalSpoilageQty = dealRepository.sumSpoilageQtyBetween(userId, start, end);
        BigDecimal avgSpoilagePct = totalBought.compareTo(BigDecimal.ZERO) > 0
                ? totalSpoilageQty.multiply(BigDecimal.valueOf(100)).divide(totalBought, 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        return WeeklyPnL.builder()
                .weekStart(start).weekEnd(end).totalDeals(totalDeals)
                .totalBought(totalBought).totalSold(totalSold).grossMargin(grossMargin)
                .totalCosts(totalCosts).netProfit(netProfit)
                .totalSpoilageQty(totalSpoilageQty).avgSpoilagePct(avgSpoilagePct)
                .build();
    }

    @GetMapping("/pending-payments")
    public PendingPayments pendingPayments(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        BigDecimal fromBuyers = dealRepository.sumPendingFromBuyers(userId);
        BigDecimal toFarmers = dealRepository.sumPendingToFarmers(userId);
        return PendingPayments.builder()
                .fromBuyers(List.of())
                .toFarmers(List.of())
                .totalFromBuyers(fromBuyers)
                .totalToFarmers(toFarmers)
                .netPosition(fromBuyers.subtract(toFarmers))
                .build();
    }
}
