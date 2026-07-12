package com.nearkart.controller;

import com.nearkart.dto.sale.*;
import com.nearkart.entity.SaleEntry;
import com.nearkart.repository.SaleEntryRepository;
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
@RequestMapping("/api/sales")
@Transactional
public class SaleController {

    private final SaleEntryRepository saleEntryRepository;

    public SaleController(SaleEntryRepository saleEntryRepository) {
        this.saleEntryRepository = saleEntryRepository;
    }

    @GetMapping
    public List<SaleEntryResponse> list(@RequestParam(defaultValue = "50") int limit,
                                         @RequestParam(defaultValue = "0") int offset,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return saleEntryRepository.findByUserIdOrderBySaleDateDesc(userId, PageRequest.of(offset / Math.max(limit, 1), limit))
                .stream().map(SaleEntryResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SaleEntryResponse create(@Valid @RequestBody SaleEntryCreate body,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        SaleEntry s = SaleEntry.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .buyerId(body.getBuyerId())
                .productId(body.getProductId())
                .invoiceNo(body.getInvoiceNo())
                .saleDate(body.getSaleDate())
                .quantity(body.getQuantity())
                .rate(body.getRate())
                .grossAmount(body.getGrossAmount())
                .transportCost(body.getTransportCost() != null ? body.getTransportCost() : BigDecimal.ZERO)
                .lrNo(body.getLrNo())
                .driverName(body.getDriverName())
                .vehicleNo(body.getVehicleNo())
                .ownerName(body.getOwnerName())
                .hsnCode(body.getHsnCode())
                .tcsAmount(body.getTcsAmount() != null ? body.getTcsAmount() : BigDecimal.ZERO)
                .addTopay(body.getAddTopay() != null ? body.getAddTopay() : BigDecimal.ZERO)
                .lessTopay(body.getLessTopay() != null ? body.getLessTopay() : BigDecimal.ZERO)
                .netAmount(body.getNetAmount())
                .poNo(body.getPoNo())
                .branch(body.getBranch())
                .build();
        return SaleEntryResponse.from(saleEntryRepository.save(s));
    }

    @GetMapping("/{id}")
    public SaleEntryResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return SaleEntryResponse.from(saleEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sale entry not found")));
    }

    @PatchMapping("/{id}")
    public SaleEntryResponse update(@PathVariable UUID id, @RequestBody SaleEntryUpdate body,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        SaleEntry s = saleEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sale entry not found"));
        if (body.getCompanyId() != null) s.setCompanyId(body.getCompanyId());
        if (body.getBuyerId() != null) s.setBuyerId(body.getBuyerId());
        if (body.getProductId() != null) s.setProductId(body.getProductId());
        if (body.getInvoiceNo() != null) s.setInvoiceNo(body.getInvoiceNo());
        if (body.getSaleDate() != null) s.setSaleDate(body.getSaleDate());
        if (body.getQuantity() != null) s.setQuantity(body.getQuantity());
        if (body.getRate() != null) s.setRate(body.getRate());
        if (body.getGrossAmount() != null) s.setGrossAmount(body.getGrossAmount());
        if (body.getTransportCost() != null) s.setTransportCost(body.getTransportCost());
        if (body.getLrNo() != null) s.setLrNo(body.getLrNo());
        if (body.getDriverName() != null) s.setDriverName(body.getDriverName());
        if (body.getVehicleNo() != null) s.setVehicleNo(body.getVehicleNo());
        if (body.getOwnerName() != null) s.setOwnerName(body.getOwnerName());
        if (body.getHsnCode() != null) s.setHsnCode(body.getHsnCode());
        if (body.getTcsAmount() != null) s.setTcsAmount(body.getTcsAmount());
        if (body.getAddTopay() != null) s.setAddTopay(body.getAddTopay());
        if (body.getLessTopay() != null) s.setLessTopay(body.getLessTopay());
        if (body.getNetAmount() != null) s.setNetAmount(body.getNetAmount());
        if (body.getPoNo() != null) s.setPoNo(body.getPoNo());
        if (body.getBranch() != null) s.setBranch(body.getBranch());
        return SaleEntryResponse.from(saleEntryRepository.save(s));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        SaleEntry s = saleEntryRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sale entry not found"));
        saleEntryRepository.delete(s);
    }
}
