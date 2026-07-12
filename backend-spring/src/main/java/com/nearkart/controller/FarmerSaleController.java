package com.nearkart.controller;

import com.nearkart.dto.farmer_flow.*;
import com.nearkart.entity.FarmerSale;
import com.nearkart.repository.FarmerSaleRepository;
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
@RequestMapping("/api/farmer-sales")
@Transactional
public class FarmerSaleController {

    private final FarmerSaleRepository farmerSaleRepository;

    public FarmerSaleController(FarmerSaleRepository farmerSaleRepository) {
        this.farmerSaleRepository = farmerSaleRepository;
    }

    @GetMapping
    public List<FarmerSaleResponse> list(@RequestParam(defaultValue = "50") int limit,
                                          @RequestParam(defaultValue = "0") int offset,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        List<FarmerSale> sales = farmerSaleRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(offset / limit, limit));
        return sales.stream().map(FarmerSaleResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FarmerSaleResponse create(@Valid @RequestBody FarmerSaleCreate body,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        FarmerSale s = FarmerSale.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .farmerEntryId(body.getFarmerEntryId())
                .marketFees(body.getMarketFees())
                .supervision(body.getSupervision())
                .adatCommission(body.getAdatCommission())
                .bardan(body.getBardan())
                .labour(body.getLabour())
                .sutli(body.getSutli())
                .gadiBhada(body.getGadiBhada())
                .weightShort(body.getWeightShort())
                .totalDeductions(body.getTotalDeductions())
                .netPayable(body.getNetPayable())
                .build();
        return FarmerSaleResponse.from(farmerSaleRepository.save(s));
    }

    @GetMapping("/{id}")
    public FarmerSaleResponse get(@PathVariable UUID id,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        return FarmerSaleResponse.from(farmerSaleRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer sale not found")));
    }

    @PatchMapping("/{id}")
    public FarmerSaleResponse update(@PathVariable UUID id,
                                      @RequestBody FarmerSaleUpdate body,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        FarmerSale s = farmerSaleRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer sale not found"));
        if (body.getMarketFees() != null) s.setMarketFees(body.getMarketFees());
        if (body.getSupervision() != null) s.setSupervision(body.getSupervision());
        if (body.getAdatCommission() != null) s.setAdatCommission(body.getAdatCommission());
        if (body.getBardan() != null) s.setBardan(body.getBardan());
        if (body.getLabour() != null) s.setLabour(body.getLabour());
        if (body.getSutli() != null) s.setSutli(body.getSutli());
        if (body.getGadiBhada() != null) s.setGadiBhada(body.getGadiBhada());
        if (body.getWeightShort() != null) s.setWeightShort(body.getWeightShort());
        if (body.getTotalDeductions() != null) s.setTotalDeductions(body.getTotalDeductions());
        if (body.getNetPayable() != null) s.setNetPayable(body.getNetPayable());
        return FarmerSaleResponse.from(farmerSaleRepository.save(s));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        FarmerSale s = farmerSaleRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer sale not found"));
        farmerSaleRepository.delete(s);
    }
}
