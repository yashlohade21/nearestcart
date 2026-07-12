package com.nearkart.controller;

import com.nearkart.dto.purchase.*;
import com.nearkart.entity.PurchaseEntry;
import com.nearkart.repository.PurchaseEntryRepository;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/purchases")
@Transactional
public class PurchaseController {

    private final PurchaseEntryRepository purchaseEntryRepository;

    public PurchaseController(PurchaseEntryRepository purchaseEntryRepository) {
        this.purchaseEntryRepository = purchaseEntryRepository;
    }

    @GetMapping
    public List<PurchaseEntryResponse> list(@RequestParam(defaultValue = "50") int limit,
                                             @RequestParam(defaultValue = "0") int offset,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return purchaseEntryRepository.findByUserIdOrderByPDateDesc(userId, PageRequest.of(offset / Math.max(limit, 1), limit))
                .stream().map(PurchaseEntryResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseEntryResponse create(@Valid @RequestBody PurchaseEntryCreate body,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        PurchaseEntry p = PurchaseEntry.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .supplierId(body.getSupplierId())
                .productId(body.getProductId())
                .agentId(body.getAgentId())
                .billNo(body.getBillNo())
                .pDate(body.getPDate())
                .vehicleNo(body.getVehicleNo())
                .quantity(body.getQuantity())
                .rate(body.getRate())
                .grossAmount(body.getGrossAmount())
                .transportCost(body.getTransportCost() != null ? body.getTransportCost() : BigDecimal.ZERO)
                .loadingCost(body.getLoadingCost() != null ? body.getLoadingCost() : BigDecimal.ZERO)
                .unloadingCost(body.getUnloadingCost() != null ? body.getUnloadingCost() : BigDecimal.ZERO)
                .advance(body.getAdvance() != null ? body.getAdvance() : BigDecimal.ZERO)
                .netAmount(body.getNetAmount())
                .commissionDeduction(body.getCommissionDeduction() != null ? body.getCommissionDeduction() : BigDecimal.ZERO)
                .branch(body.getBranch())
                .notes(body.getNotes())
                .build();
        return PurchaseEntryResponse.from(purchaseEntryRepository.save(p));
    }

    @GetMapping("/{id}")
    public PurchaseEntryResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return PurchaseEntryResponse.from(purchaseEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase entry not found")));
    }

    @PatchMapping("/{id}")
    public PurchaseEntryResponse update(@PathVariable UUID id, @RequestBody PurchaseEntryUpdate body,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        PurchaseEntry p = purchaseEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase entry not found"));
        if (body.getCompanyId() != null) p.setCompanyId(body.getCompanyId());
        if (body.getSupplierId() != null) p.setSupplierId(body.getSupplierId());
        if (body.getProductId() != null) p.setProductId(body.getProductId());
        if (body.getAgentId() != null) p.setAgentId(body.getAgentId());
        if (body.getBillNo() != null) p.setBillNo(body.getBillNo());
        if (body.getPDate() != null) p.setPDate(body.getPDate());
        if (body.getVehicleNo() != null) p.setVehicleNo(body.getVehicleNo());
        if (body.getQuantity() != null) p.setQuantity(body.getQuantity());
        if (body.getRate() != null) p.setRate(body.getRate());
        if (body.getGrossAmount() != null) p.setGrossAmount(body.getGrossAmount());
        if (body.getTransportCost() != null) p.setTransportCost(body.getTransportCost());
        if (body.getLoadingCost() != null) p.setLoadingCost(body.getLoadingCost());
        if (body.getUnloadingCost() != null) p.setUnloadingCost(body.getUnloadingCost());
        if (body.getAdvance() != null) p.setAdvance(body.getAdvance());
        if (body.getNetAmount() != null) p.setNetAmount(body.getNetAmount());
        if (body.getCommissionDeduction() != null) p.setCommissionDeduction(body.getCommissionDeduction());
        if (body.getBranch() != null) p.setBranch(body.getBranch());
        if (body.getNotes() != null) p.setNotes(body.getNotes());
        return PurchaseEntryResponse.from(purchaseEntryRepository.save(p));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        PurchaseEntry p = purchaseEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase entry not found"));
        purchaseEntryRepository.delete(p);
    }
}
