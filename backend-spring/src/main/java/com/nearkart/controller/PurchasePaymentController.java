package com.nearkart.controller;

import com.nearkart.dto.purchase.*;
import com.nearkart.entity.PurchasePayment;
import com.nearkart.repository.PurchasePaymentRepository;
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
@RequestMapping("/api/purchase-payments")
@Transactional
public class PurchasePaymentController {

    private final PurchasePaymentRepository purchasePaymentRepository;

    public PurchasePaymentController(PurchasePaymentRepository purchasePaymentRepository) {
        this.purchasePaymentRepository = purchasePaymentRepository;
    }

    @GetMapping
    public List<PurchasePaymentResponse> list(@RequestParam(defaultValue = "50") int limit,
                                               @RequestParam(defaultValue = "0") int offset,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        List<PurchasePayment> payments = purchasePaymentRepository
                .findByUserIdOrderByPaymentDateDesc(userId, PageRequest.of(offset / limit, limit));
        return payments.stream().map(PurchasePaymentResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchasePaymentResponse create(@Valid @RequestBody PurchasePaymentCreate body,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        PurchasePayment p = PurchasePayment.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .supplierId(body.getSupplierId())
                .paymentDate(body.getPaymentDate())
                .billNo(body.getBillNo())
                .total(body.getTotal())
                .paid(body.getPaid())
                .balance(body.getBalance())
                .bankName(body.getBankName())
                .chequeNo(body.getChequeNo())
                .paymentMode(body.getPaymentMode())
                .narration(body.getNarration())
                .build();
        return PurchasePaymentResponse.from(purchasePaymentRepository.save(p));
    }

    @GetMapping("/{id}")
    public PurchasePaymentResponse get(@PathVariable UUID id,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        return PurchasePaymentResponse.from(purchasePaymentRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase payment not found")));
    }

    @PatchMapping("/{id}")
    public PurchasePaymentResponse update(@PathVariable UUID id,
                                           @RequestBody PurchasePaymentUpdate body,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        PurchasePayment p = purchasePaymentRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase payment not found"));
        if (body.getCompanyId() != null) p.setCompanyId(body.getCompanyId());
        if (body.getSupplierId() != null) p.setSupplierId(body.getSupplierId());
        if (body.getPaymentDate() != null) p.setPaymentDate(body.getPaymentDate());
        if (body.getBillNo() != null) p.setBillNo(body.getBillNo());
        if (body.getTotal() != null) p.setTotal(body.getTotal());
        if (body.getPaid() != null) p.setPaid(body.getPaid());
        if (body.getBalance() != null) p.setBalance(body.getBalance());
        if (body.getBankName() != null) p.setBankName(body.getBankName());
        if (body.getChequeNo() != null) p.setChequeNo(body.getChequeNo());
        if (body.getPaymentMode() != null) p.setPaymentMode(body.getPaymentMode());
        if (body.getNarration() != null) p.setNarration(body.getNarration());
        return PurchasePaymentResponse.from(purchasePaymentRepository.save(p));
    }

    @GetMapping("/ledger/{supplierId}")
    public List<PurchasePaymentResponse> ledger(@PathVariable UUID supplierId,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return purchasePaymentRepository.findByUserIdAndSupplierId(userId, supplierId)
                .stream().map(PurchasePaymentResponse::from).toList();
    }
}
