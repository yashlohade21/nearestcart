package com.nearkart.controller;

import com.nearkart.dto.farmer_flow.*;
import com.nearkart.entity.FarmerEntry;
import com.nearkart.repository.FarmerEntryRepository;
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
@RequestMapping("/api/farmer-entries")
@Transactional
public class FarmerEntryController {

    private final FarmerEntryRepository farmerEntryRepository;

    public FarmerEntryController(FarmerEntryRepository farmerEntryRepository) {
        this.farmerEntryRepository = farmerEntryRepository;
    }

    @GetMapping
    public List<FarmerEntryResponse> list(@RequestParam(defaultValue = "50") int limit,
                                           @RequestParam(defaultValue = "0") int offset,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        List<FarmerEntry> entries = farmerEntryRepository
                .findByUserIdOrderByEntryDateDesc(userId, PageRequest.of(offset / limit, limit));
        return entries.stream().map(FarmerEntryResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FarmerEntryResponse create(@Valid @RequestBody FarmerEntryCreate body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        FarmerEntry e = FarmerEntry.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .invoiceNo(body.getInvoiceNo())
                .entryDate(body.getEntryDate())
                .farmerId(body.getFarmerId())
                .village(body.getVillage())
                .kharidarId(body.getKharidarId())
                .productId(body.getProductId())
                .weight(body.getWeight())
                .rate(body.getRate())
                .amount(body.getAmount())
                .hamali(body.getHamali())
                .tawali(body.getTawali())
                .warai(body.getWarai())
                .autoCharge(body.getAutoCharge())
                .kharcha(body.getKharcha())
                .mobileNo(body.getMobileNo())
                .build();
        return FarmerEntryResponse.from(farmerEntryRepository.save(e));
    }

    @GetMapping("/{id}")
    public FarmerEntryResponse get(@PathVariable UUID id,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return FarmerEntryResponse.from(farmerEntryRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer entry not found")));
    }

    @PatchMapping("/{id}")
    public FarmerEntryResponse update(@PathVariable UUID id,
                                       @RequestBody FarmerEntryUpdate body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        FarmerEntry e = farmerEntryRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer entry not found"));
        if (body.getCompanyId() != null) e.setCompanyId(body.getCompanyId());
        if (body.getInvoiceNo() != null) e.setInvoiceNo(body.getInvoiceNo());
        if (body.getEntryDate() != null) e.setEntryDate(body.getEntryDate());
        if (body.getFarmerId() != null) e.setFarmerId(body.getFarmerId());
        if (body.getVillage() != null) e.setVillage(body.getVillage());
        if (body.getKharidarId() != null) e.setKharidarId(body.getKharidarId());
        if (body.getProductId() != null) e.setProductId(body.getProductId());
        if (body.getWeight() != null) e.setWeight(body.getWeight());
        if (body.getRate() != null) e.setRate(body.getRate());
        if (body.getAmount() != null) e.setAmount(body.getAmount());
        if (body.getHamali() != null) e.setHamali(body.getHamali());
        if (body.getTawali() != null) e.setTawali(body.getTawali());
        if (body.getWarai() != null) e.setWarai(body.getWarai());
        if (body.getAutoCharge() != null) e.setAutoCharge(body.getAutoCharge());
        if (body.getKharcha() != null) e.setKharcha(body.getKharcha());
        if (body.getMobileNo() != null) e.setMobileNo(body.getMobileNo());
        return FarmerEntryResponse.from(farmerEntryRepository.save(e));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        FarmerEntry e = farmerEntryRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer entry not found"));
        farmerEntryRepository.delete(e);
    }
}
