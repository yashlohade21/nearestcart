package com.nearkart.controller;

import com.nearkart.dto.bank.*;
import com.nearkart.entity.BankAccount;
import com.nearkart.repository.BankAccountRepository;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bank-accounts")
@Transactional
public class BankAccountController {

    private final BankAccountRepository bankAccountRepository;

    public BankAccountController(BankAccountRepository bankAccountRepository) {
        this.bankAccountRepository = bankAccountRepository;
    }

    @GetMapping
    public List<BankAccountResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return bankAccountRepository.findByUserIdOrderByBankNameAsc(userId)
                .stream().map(BankAccountResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BankAccountResponse create(@Valid @RequestBody BankAccountCreate body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        BankAccount b = BankAccount.builder()
                .userId(principal.getEffectiveUserId())
                .bankName(body.getBankName())
                .accountHolderName(body.getAccountHolderName())
                .accountNo(body.getAccountNo())
                .accountType(body.getAccountType() != null ? body.getAccountType() : "current")
                .ifscCode(body.getIfscCode())
                .branch(body.getBranch())
                .openingBalance(body.getOpeningBalance())
                .notes(body.getNotes())
                .build();
        return BankAccountResponse.from(bankAccountRepository.save(b));
    }

    @GetMapping("/{id}")
    public BankAccountResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return BankAccountResponse.from(bankAccountRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found")));
    }

    @PatchMapping("/{id}")
    public BankAccountResponse update(@PathVariable UUID id, @RequestBody BankAccountUpdate body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        BankAccount b = bankAccountRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found"));
        if (body.getBankName() != null) b.setBankName(body.getBankName());
        if (body.getAccountHolderName() != null) b.setAccountHolderName(body.getAccountHolderName());
        if (body.getAccountNo() != null) b.setAccountNo(body.getAccountNo());
        if (body.getAccountType() != null) b.setAccountType(body.getAccountType());
        if (body.getIfscCode() != null) b.setIfscCode(body.getIfscCode());
        if (body.getBranch() != null) b.setBranch(body.getBranch());
        if (body.getOpeningBalance() != null) b.setOpeningBalance(body.getOpeningBalance());
        if (body.getCurrentBalance() != null) b.setCurrentBalance(body.getCurrentBalance());
        if (body.getNotes() != null) b.setNotes(body.getNotes());
        if (body.getIsActive() != null) b.setIsActive(body.getIsActive());
        return BankAccountResponse.from(bankAccountRepository.save(b));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        BankAccount b = bankAccountRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found"));
        b.setIsActive(false);
        bankAccountRepository.save(b);
    }
}
