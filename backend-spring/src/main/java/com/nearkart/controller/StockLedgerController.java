package com.nearkart.controller;

import com.nearkart.dto.stock.StockAdjustRequest;
import com.nearkart.dto.stock.StockLedgerResponse;
import com.nearkart.entity.StockLedger;
import com.nearkart.repository.StockLedgerRepository;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/stock")
@Transactional
public class StockLedgerController {

    private final StockLedgerRepository stockLedgerRepository;

    public StockLedgerController(StockLedgerRepository stockLedgerRepository) {
        this.stockLedgerRepository = stockLedgerRepository;
    }

    @GetMapping
    public List<StockLedgerResponse> list(@RequestParam(defaultValue = "50") int limit,
                                           @RequestParam(defaultValue = "0") int offset,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return stockLedgerRepository.findByUserIdOrderByTxnDateDesc(userId, PageRequest.of(offset / limit, limit))
                .stream().map(StockLedgerResponse::from).toList();
    }

    @GetMapping("/product/{productId}")
    public List<StockLedgerResponse> listByProduct(@PathVariable UUID productId,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return stockLedgerRepository.findByUserIdAndProductIdOrderByTxnDateDesc(userId, productId)
                .stream().map(StockLedgerResponse::from).toList();
    }

    @GetMapping("/summary")
    public List<Map<String, Object>> summary(@AuthenticationPrincipal UserPrincipal principal) {
        return List.of();
    }

    @PostMapping("/adjust")
    @ResponseStatus(HttpStatus.CREATED)
    public StockLedgerResponse adjust(@Valid @RequestBody StockAdjustRequest body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();

        // Compute balanceAfter from latest entry for this product
        List<StockLedger> existing = stockLedgerRepository.findByUserIdAndProductIdOrderByTxnDateDesc(userId, body.getProductId());
        BigDecimal previousBalance = existing.isEmpty() ? BigDecimal.ZERO : existing.get(0).getBalanceAfter();

        BigDecimal balanceAfter;
        if ("purchase".equalsIgnoreCase(body.getTxnType()) || "return".equalsIgnoreCase(body.getTxnType())) {
            balanceAfter = previousBalance.add(body.getQuantity());
        } else {
            balanceAfter = previousBalance.subtract(body.getQuantity());
        }

        StockLedger entry = StockLedger.builder()
                .userId(userId)
                .companyId(body.getCompanyId())
                .productId(body.getProductId())
                .txnDate(body.getTxnDate() != null ? body.getTxnDate() : LocalDate.now())
                .txnType(body.getTxnType())
                .quantity(body.getQuantity())
                .referenceId(body.getReferenceId())
                .referenceType(body.getReferenceType())
                .balanceAfter(balanceAfter)
                .build();
        return StockLedgerResponse.from(stockLedgerRepository.save(entry));
    }
}
