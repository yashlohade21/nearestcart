package com.nearkart.controller;

import com.nearkart.dto.expense.*;
import com.nearkart.entity.Expense;
import com.nearkart.repository.ExpenseRepository;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@Transactional
public class ExpenseController {

    private final ExpenseRepository expenseRepository;

    public ExpenseController(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @GetMapping
    public List<ExpenseResponse> list(@RequestParam(defaultValue = "50") int limit,
                                       @RequestParam(defaultValue = "0") int offset,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(userId, PageRequest.of(offset / Math.max(limit, 1), limit))
                .stream().map(ExpenseResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@Valid @RequestBody ExpenseCreate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        Expense e = Expense.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .expenseDate(body.getExpenseDate())
                .category(body.getCategory())
                .narration(body.getNarration())
                .amount(body.getAmount())
                .paymentMode(body.getPaymentMode())
                .bankAccountId(body.getBankAccountId())
                .chequeNo(body.getChequeNo())
                .partyName(body.getPartyName())
                .farmerBillRef(body.getFarmerBillRef())
                .build();
        return ExpenseResponse.from(expenseRepository.save(e));
    }

    @GetMapping("/{id}")
    public ExpenseResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return ExpenseResponse.from(expenseRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found")));
    }

    @PatchMapping("/{id}")
    public ExpenseResponse update(@PathVariable UUID id, @RequestBody ExpenseUpdate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        Expense e = expenseRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (body.getCompanyId() != null) e.setCompanyId(body.getCompanyId());
        if (body.getExpenseDate() != null) e.setExpenseDate(body.getExpenseDate());
        if (body.getCategory() != null) e.setCategory(body.getCategory());
        if (body.getNarration() != null) e.setNarration(body.getNarration());
        if (body.getAmount() != null) e.setAmount(body.getAmount());
        if (body.getPaymentMode() != null) e.setPaymentMode(body.getPaymentMode());
        if (body.getBankAccountId() != null) e.setBankAccountId(body.getBankAccountId());
        if (body.getChequeNo() != null) e.setChequeNo(body.getChequeNo());
        if (body.getPartyName() != null) e.setPartyName(body.getPartyName());
        if (body.getFarmerBillRef() != null) e.setFarmerBillRef(body.getFarmerBillRef());
        return ExpenseResponse.from(expenseRepository.save(e));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Expense e = expenseRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        expenseRepository.delete(e);
    }

    @GetMapping("/summary")
    public Map<String, BigDecimal> summary(@AuthenticationPrincipal UserPrincipal principal) {
        BigDecimal total = expenseRepository.sumTotalExpenses(principal.getEffectiveUserId());
        return Map.of("total_expenses", total);
    }
}
