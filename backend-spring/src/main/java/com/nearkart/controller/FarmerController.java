package com.nearkart.controller;

import com.nearkart.dto.farmer.*;
import com.nearkart.entity.Farmer;
import com.nearkart.repository.FarmerRepository;
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
@RequestMapping("/api/farmers")
@Transactional
public class FarmerController {

    private final FarmerRepository farmerRepository;

    public FarmerController(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    @GetMapping
    public List<FarmerResponse> list(@RequestParam(required = false) String search,
                                     @RequestParam(defaultValue = "50") int limit,
                                     @RequestParam(defaultValue = "0") int offset,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        List<Farmer> farmers;
        if (search != null && !search.isBlank()) {
            farmers = farmerRepository.findByUserIdAndNameContainingIgnoreCase(userId, search, PageRequest.of(offset / limit, limit));
        } else {
            farmers = farmerRepository.findByUserId(userId, PageRequest.of(offset / limit, limit));
        }
        return farmers.stream().map(FarmerResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FarmerResponse create(@Valid @RequestBody FarmerCreate body,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        Farmer f = Farmer.builder()
                .userId(principal.getEffectiveUserId())
                .name(body.getName()).phone(body.getPhone()).email(body.getEmail())
                .village(body.getVillage()).district(body.getDistrict()).state(body.getState())
                .address(body.getAddress()).panNumber(body.getPanNumber())
                .openingBalance(body.getOpeningBalance()).creditDays(body.getCreditDays())
                .primaryCrops(body.getPrimaryCrops() != null ? body.getPrimaryCrops().toArray(new String[0]) : null)
                .notes(body.getNotes())
                .build();
        return FarmerResponse.from(farmerRepository.save(f));
    }

    @GetMapping("/{id}")
    public FarmerResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return FarmerResponse.from(farmerRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer not found")));
    }

    @PatchMapping("/{id}")
    public FarmerResponse update(@PathVariable UUID id, @RequestBody FarmerUpdate body,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        Farmer f = farmerRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer not found"));
        if (body.getName() != null) f.setName(body.getName());
        if (body.getPhone() != null) f.setPhone(body.getPhone());
        if (body.getEmail() != null) f.setEmail(body.getEmail());
        if (body.getVillage() != null) f.setVillage(body.getVillage());
        if (body.getDistrict() != null) f.setDistrict(body.getDistrict());
        if (body.getState() != null) f.setState(body.getState());
        if (body.getAddress() != null) f.setAddress(body.getAddress());
        if (body.getPanNumber() != null) f.setPanNumber(body.getPanNumber());
        if (body.getOpeningBalance() != null) f.setOpeningBalance(body.getOpeningBalance());
        if (body.getCreditDays() != null) f.setCreditDays(body.getCreditDays());
        if (body.getPrimaryCrops() != null) f.setPrimaryCrops(body.getPrimaryCrops().toArray(new String[0]));
        if (body.getNotes() != null) f.setNotes(body.getNotes());
        if (body.getIsActive() != null) f.setIsActive(body.getIsActive());
        return FarmerResponse.from(farmerRepository.save(f));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Farmer f = farmerRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer not found"));
        f.setIsActive(false);
        farmerRepository.save(f);
    }
}
