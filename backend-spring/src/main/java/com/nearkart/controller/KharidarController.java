package com.nearkart.controller;

import com.nearkart.dto.kharidar.KharidarCreate;
import com.nearkart.dto.kharidar.KharidarUpdate;
import com.nearkart.dto.kharidar.KharidarResponse;
import com.nearkart.entity.Kharidar;
import com.nearkart.repository.KharidarRepository;
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
@RequestMapping("/api/kharidars")
@Transactional
public class KharidarController {

    private final KharidarRepository kharidarRepository;

    public KharidarController(KharidarRepository kharidarRepository) {
        this.kharidarRepository = kharidarRepository;
    }

    @GetMapping
    public List<KharidarResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return kharidarRepository.findByUserIdOrderByNameAsc(userId)
                .stream().map(KharidarResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KharidarResponse create(@Valid @RequestBody KharidarCreate body,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        Kharidar k = Kharidar.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .name(body.getName())
                .phone(body.getPhone())
                .address(body.getAddress())
                .build();
        return KharidarResponse.from(kharidarRepository.save(k));
    }

    @GetMapping("/{id}")
    public KharidarResponse get(@PathVariable UUID id,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        return KharidarResponse.from(kharidarRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kharidar not found")));
    }

    @PatchMapping("/{id}")
    public KharidarResponse update(@PathVariable UUID id, @RequestBody KharidarUpdate body,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        Kharidar k = kharidarRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kharidar not found"));
        if (body.getCompanyId() != null) k.setCompanyId(body.getCompanyId());
        if (body.getName() != null) k.setName(body.getName());
        if (body.getPhone() != null) k.setPhone(body.getPhone());
        if (body.getAddress() != null) k.setAddress(body.getAddress());
        if (body.getIsActive() != null) k.setIsActive(body.getIsActive());
        return KharidarResponse.from(kharidarRepository.save(k));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Kharidar k = kharidarRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kharidar not found"));
        k.setIsActive(false);
        kharidarRepository.save(k);
    }
}
