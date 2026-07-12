package com.nearkart.controller;

import com.nearkart.dto.advance.*;
import com.nearkart.entity.Advance;
import com.nearkart.repository.AdvanceRepository;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/advances")
@Transactional
public class AdvanceController {

    private final AdvanceRepository advanceRepository;

    public AdvanceController(AdvanceRepository advanceRepository) {
        this.advanceRepository = advanceRepository;
    }

    @GetMapping
    public List<AdvanceResponse> list(@RequestParam(defaultValue = "50") int limit,
                                       @RequestParam(defaultValue = "0") int offset,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return advanceRepository.findByUserIdOrderByGivenDateDesc(userId, PageRequest.of(offset / Math.max(limit, 1), limit))
                .stream().map(AdvanceResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdvanceResponse create(@Valid @RequestBody AdvanceCreate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        Advance a = Advance.builder()
                .userId(principal.getEffectiveUserId())
                .farmerId(body.getFarmerId())
                .amount(body.getAmount())
                .purpose(body.getPurpose())
                .givenDate(body.getGivenDate() != null ? body.getGivenDate() : LocalDate.now())
                .expectedRecoveryDate(body.getExpectedRecoveryDate())
                .notes(body.getNotes())
                .build();
        return AdvanceResponse.from(advanceRepository.save(a));
    }

    @GetMapping("/active")
    public List<AdvanceResponse> active(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return advanceRepository.findByUserIdAndStatusIn(userId, List.of("active", "partial"))
                .stream().map(AdvanceResponse::from).toList();
    }

    @GetMapping("/{id}")
    public AdvanceResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return AdvanceResponse.from(advanceRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advance not found")));
    }

    @PatchMapping("/{id}")
    public AdvanceResponse update(@PathVariable UUID id, @RequestBody AdvanceUpdate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        Advance a = advanceRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advance not found"));
        if (body.getRecovered() != null) a.setRecovered(body.getRecovered());
        if (body.getStatus() != null) a.setStatus(body.getStatus());
        if (body.getExpectedRecoveryDate() != null) a.setExpectedRecoveryDate(body.getExpectedRecoveryDate());
        if (body.getNotes() != null) a.setNotes(body.getNotes());
        return AdvanceResponse.from(advanceRepository.save(a));
    }
}
