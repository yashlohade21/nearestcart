package com.nearkart.controller;

import com.nearkart.dto.farmer_flow.*;
import com.nearkart.entity.FarmerPayment;
import com.nearkart.repository.FarmerPaymentRepository;
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
@RequestMapping("/api/farmer-payments")
@Transactional
public class FarmerPaymentController {

    private final FarmerPaymentRepository farmerPaymentRepository;

    public FarmerPaymentController(FarmerPaymentRepository farmerPaymentRepository) {
        this.farmerPaymentRepository = farmerPaymentRepository;
    }

    @GetMapping
    public List<FarmerPaymentResponse> list(@RequestParam(defaultValue = "50") int limit,
                                             @RequestParam(defaultValue = "0") int offset,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        List<FarmerPayment> payments = farmerPaymentRepository
                .findByUserIdOrderByPaymentDateDesc(userId, PageRequest.of(offset / limit, limit));
        return payments.stream().map(FarmerPaymentResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FarmerPaymentResponse create(@Valid @RequestBody FarmerPaymentCreate body,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        FarmerPayment p = FarmerPayment.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .farmerId(body.getFarmerId())
                .paymentDate(body.getPaymentDate())
                .amount(body.getAmount())
                .cashAmount(body.getCashAmount())
                .bankName(body.getBankName())
                .chequeNo(body.getChequeNo())
                .narration(body.getNarration())
                .build();
        return FarmerPaymentResponse.from(farmerPaymentRepository.save(p));
    }

    @GetMapping("/{id}")
    public FarmerPaymentResponse get(@PathVariable UUID id,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        return FarmerPaymentResponse.from(farmerPaymentRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer payment not found")));
    }

    @GetMapping("/balance/{farmerId}")
    public Map<String, BigDecimal> balance(@PathVariable UUID farmerId,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        BigDecimal totalPaid = farmerPaymentRepository.sumPaymentsByFarmer(userId, farmerId);
        return Map.of("total_paid", totalPaid);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        FarmerPayment p = farmerPaymentRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Farmer payment not found"));
        farmerPaymentRepository.delete(p);
    }
}
