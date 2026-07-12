package com.nearkart.controller;

import com.nearkart.dto.bank.*;
import com.nearkart.entity.BankTransaction;
import com.nearkart.repository.BankTransactionRepository;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bank-transactions")
@Transactional
public class BankTransactionController {

    private final BankTransactionRepository bankTransactionRepository;

    public BankTransactionController(BankTransactionRepository bankTransactionRepository) {
        this.bankTransactionRepository = bankTransactionRepository;
    }

    @GetMapping
    public List<BankTransactionResponse> list(@RequestParam(defaultValue = "50") int limit,
                                               @RequestParam(defaultValue = "0") int offset,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return bankTransactionRepository.findByUserIdOrderByTxnDateDesc(userId, PageRequest.of(offset / Math.max(limit, 1), limit))
                .stream().map(BankTransactionResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BankTransactionResponse create(@Valid @RequestBody BankTransactionCreate body,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        BankTransaction t = BankTransaction.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .bankAccountId(body.getBankAccountId())
                .txnDate(body.getTxnDate())
                .type(body.getType())
                .amount(body.getAmount())
                .partyName(body.getPartyName())
                .chequeNo(body.getChequeNo())
                .chequeDate(body.getChequeDate())
                .narration(body.getNarration())
                .reconciled(body.getReconciled() != null ? body.getReconciled() : false)
                .build();
        return BankTransactionResponse.from(bankTransactionRepository.save(t));
    }

    @GetMapping("/{id}")
    public BankTransactionResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return BankTransactionResponse.from(bankTransactionRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank transaction not found")));
    }

    @PatchMapping("/{id}")
    public BankTransactionResponse update(@PathVariable UUID id, @RequestBody BankTransactionUpdate body,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        BankTransaction t = bankTransactionRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank transaction not found"));
        if (body.getBankAccountId() != null) t.setBankAccountId(body.getBankAccountId());
        if (body.getTxnDate() != null) t.setTxnDate(body.getTxnDate());
        if (body.getType() != null) t.setType(body.getType());
        if (body.getAmount() != null) t.setAmount(body.getAmount());
        if (body.getPartyName() != null) t.setPartyName(body.getPartyName());
        if (body.getChequeNo() != null) t.setChequeNo(body.getChequeNo());
        if (body.getChequeDate() != null) t.setChequeDate(body.getChequeDate());
        if (body.getNarration() != null) t.setNarration(body.getNarration());
        if (body.getReconciled() != null) t.setReconciled(body.getReconciled());
        return BankTransactionResponse.from(bankTransactionRepository.save(t));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        BankTransaction t = bankTransactionRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank transaction not found"));
        bankTransactionRepository.delete(t);
    }

    @PostMapping("/{id}/reconcile")
    public BankTransactionResponse reconcile(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        BankTransaction t = bankTransactionRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank transaction not found"));
        t.setReconciled(true);
        return BankTransactionResponse.from(bankTransactionRepository.save(t));
    }
}
