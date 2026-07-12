package com.nearkart.controller;

import com.nearkart.dto.company.*;
import com.nearkart.entity.Company;
import com.nearkart.repository.CompanyRepository;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@Transactional
public class CompanyController {

    private final CompanyRepository companyRepository;

    public CompanyController(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @GetMapping
    public List<CompanyResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return companyRepository.findByUserIdOrderByNameAsc(userId)
                .stream().map(CompanyResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse create(@Valid @RequestBody CompanyCreate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        Company c = Company.builder()
                .userId(userId)
                .name(body.getName())
                .address(body.getAddress())
                .gstNo(body.getGstNo())
                .panNo(body.getPanNo())
                .logoUrl(body.getLogoUrl())
                .isDefault(body.getIsDefault() != null ? body.getIsDefault() : false)
                .phone(body.getPhone())
                .email(body.getEmail())
                .bankName(body.getBankName())
                .accountNo(body.getAccountNo())
                .ifscCode(body.getIfscCode())
                .branch(body.getBranch())
                .build();
        // If this company is set as default, unset the previous default
        if (Boolean.TRUE.equals(c.getIsDefault())) {
            companyRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(prev -> { prev.setIsDefault(false); companyRepository.save(prev); });
        }
        return CompanyResponse.from(companyRepository.save(c));
    }

    @GetMapping("/{id}")
    public CompanyResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return CompanyResponse.from(companyRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found")));
    }

    @PatchMapping("/{id}")
    public CompanyResponse update(@PathVariable UUID id, @RequestBody CompanyUpdate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        Company c = companyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        if (body.getName() != null) c.setName(body.getName());
        if (body.getAddress() != null) c.setAddress(body.getAddress());
        if (body.getGstNo() != null) c.setGstNo(body.getGstNo());
        if (body.getPanNo() != null) c.setPanNo(body.getPanNo());
        if (body.getLogoUrl() != null) c.setLogoUrl(body.getLogoUrl());
        if (body.getIsDefault() != null) c.setIsDefault(body.getIsDefault());
        if (body.getPhone() != null) c.setPhone(body.getPhone());
        if (body.getEmail() != null) c.setEmail(body.getEmail());
        if (body.getBankName() != null) c.setBankName(body.getBankName());
        if (body.getAccountNo() != null) c.setAccountNo(body.getAccountNo());
        if (body.getIfscCode() != null) c.setIfscCode(body.getIfscCode());
        if (body.getBranch() != null) c.setBranch(body.getBranch());
        // If setting this as default, unset the previous default
        if (Boolean.TRUE.equals(body.getIsDefault())) {
            companyRepository.findByUserIdAndIsDefaultTrue(userId)
                    .filter(prev -> !prev.getId().equals(id))
                    .ifPresent(prev -> { prev.setIsDefault(false); companyRepository.save(prev); });
        }
        return CompanyResponse.from(companyRepository.save(c));
    }

    @PostMapping("/{id}/activate")
    public CompanyResponse activate(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        Company c = companyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        // Unset previous default
        companyRepository.findByUserIdAndIsDefaultTrue(userId)
                .filter(prev -> !prev.getId().equals(id))
                .ifPresent(prev -> { prev.setIsDefault(false); companyRepository.save(prev); });
        // Set this company as default
        c.setIsDefault(true);
        return CompanyResponse.from(companyRepository.save(c));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Company c = companyRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        companyRepository.delete(c);
    }
}
