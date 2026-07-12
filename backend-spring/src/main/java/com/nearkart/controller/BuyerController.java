package com.nearkart.controller;

import com.nearkart.dto.buyer.*;
import com.nearkart.entity.Buyer;
import com.nearkart.repository.BuyerRepository;
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
@RequestMapping("/api/buyers")
@Transactional
public class BuyerController {

    private final BuyerRepository buyerRepository;

    public BuyerController(BuyerRepository buyerRepository) {
        this.buyerRepository = buyerRepository;
    }

    @GetMapping
    public List<BuyerResponse> list(@RequestParam(required = false) String search,
                                    @RequestParam(defaultValue = "50") int limit,
                                    @RequestParam(defaultValue = "0") int offset,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        if (search != null && !search.isBlank()) {
            return buyerRepository.findByUserIdAndNameContainingIgnoreCase(userId, search, PageRequest.of(offset / Math.max(limit, 1), limit))
                    .stream().map(BuyerResponse::from).toList();
        }
        return buyerRepository.findByUserId(userId, PageRequest.of(offset / Math.max(limit, 1), limit))
                .stream().map(BuyerResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BuyerResponse create(@Valid @RequestBody BuyerCreate body, @AuthenticationPrincipal UserPrincipal principal) {
        Buyer b = Buyer.builder().userId(principal.getEffectiveUserId())
                .name(body.getName()).contactPerson(body.getContactPerson()).phone(body.getPhone())
                .email(body.getEmail()).companyType(body.getCompanyType()).city(body.getCity())
                .state(body.getState()).address(body.getAddress()).gstNumber(body.getGstNumber())
                .panNumber(body.getPanNumber()).openingBalance(body.getOpeningBalance())
                .creditLimit(body.getCreditLimit()).creditDays(body.getCreditDays()).notes(body.getNotes()).build();
        return BuyerResponse.from(buyerRepository.save(b));
    }

    @GetMapping("/{id}")
    public BuyerResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return BuyerResponse.from(buyerRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found")));
    }

    @PatchMapping("/{id}")
    public BuyerResponse update(@PathVariable UUID id, @RequestBody BuyerUpdate body,
                                @AuthenticationPrincipal UserPrincipal principal) {
        Buyer b = buyerRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found"));
        if (body.getName() != null) b.setName(body.getName());
        if (body.getContactPerson() != null) b.setContactPerson(body.getContactPerson());
        if (body.getPhone() != null) b.setPhone(body.getPhone());
        if (body.getEmail() != null) b.setEmail(body.getEmail());
        if (body.getCompanyType() != null) b.setCompanyType(body.getCompanyType());
        if (body.getCity() != null) b.setCity(body.getCity());
        if (body.getState() != null) b.setState(body.getState());
        if (body.getAddress() != null) b.setAddress(body.getAddress());
        if (body.getGstNumber() != null) b.setGstNumber(body.getGstNumber());
        if (body.getPanNumber() != null) b.setPanNumber(body.getPanNumber());
        if (body.getOpeningBalance() != null) b.setOpeningBalance(body.getOpeningBalance());
        if (body.getCreditLimit() != null) b.setCreditLimit(body.getCreditLimit());
        if (body.getCreditDays() != null) b.setCreditDays(body.getCreditDays());
        if (body.getNotes() != null) b.setNotes(body.getNotes());
        if (body.getIsActive() != null) b.setIsActive(body.getIsActive());
        return BuyerResponse.from(buyerRepository.save(b));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Buyer b = buyerRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found"));
        b.setIsActive(false);
        buyerRepository.save(b);
    }
}
