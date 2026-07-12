package com.nearkart.controller;

import com.nearkart.dto.cash.*;
import com.nearkart.entity.CashEntry;
import com.nearkart.repository.CashEntryRepository;
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
@RequestMapping("/api/cash-book")
@Transactional
public class CashBookController {

    private final CashEntryRepository cashEntryRepository;

    public CashBookController(CashEntryRepository cashEntryRepository) {
        this.cashEntryRepository = cashEntryRepository;
    }

    @GetMapping
    public List<CashEntryResponse> list(@RequestParam(defaultValue = "50") int limit,
                                         @RequestParam(defaultValue = "0") int offset,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return cashEntryRepository.findByUserIdOrderByEntryDateDesc(userId, PageRequest.of(offset / Math.max(limit,1), limit))
                .stream().map(CashEntryResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CashEntryResponse create(@Valid @RequestBody CashEntryCreate body,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        CashEntry e = CashEntry.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .entryDate(body.getEntryDate())
                .type(body.getType())
                .narration(body.getNarration())
                .amount(body.getAmount())
                .partyName(body.getPartyName())
                .partyType(body.getPartyType())
                .referenceNo(body.getReferenceNo())
                .branch(body.getBranch())
                .build();
        return CashEntryResponse.from(cashEntryRepository.save(e));
    }

    @GetMapping("/{id}")
    public CashEntryResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return CashEntryResponse.from(cashEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cash entry not found")));
    }

    @PatchMapping("/{id}")
    public CashEntryResponse update(@PathVariable UUID id, @RequestBody CashEntryUpdate body,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        CashEntry e = cashEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cash entry not found"));
        if (body.getType() != null) e.setType(body.getType());
        if (body.getNarration() != null) e.setNarration(body.getNarration());
        if (body.getAmount() != null) e.setAmount(body.getAmount());
        if (body.getPartyName() != null) e.setPartyName(body.getPartyName());
        if (body.getPartyType() != null) e.setPartyType(body.getPartyType());
        if (body.getReferenceNo() != null) e.setReferenceNo(body.getReferenceNo());
        if (body.getEntryDate() != null) e.setEntryDate(body.getEntryDate());
        if (body.getBranch() != null) e.setBranch(body.getBranch());
        return CashEntryResponse.from(cashEntryRepository.save(e));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        CashEntry e = cashEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cash entry not found"));
        cashEntryRepository.delete(e);
    }

    @GetMapping("/balance")
    public Map<String, BigDecimal> balance(@AuthenticationPrincipal UserPrincipal principal) {
        BigDecimal bal = cashEntryRepository.computeCashBalance(principal.getEffectiveUserId());
        return Map.of("balance", bal);
    }
}
