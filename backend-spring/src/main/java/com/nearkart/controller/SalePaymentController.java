package com.nearkart.controller;

import com.nearkart.dto.sale.*;
import com.nearkart.entity.SalePayment;
import com.nearkart.repository.SalePaymentRepository;
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
@RequestMapping("/api/sale-payments")
@Transactional
public class SalePaymentController {

    private final SalePaymentRepository salePaymentRepository;

    public SalePaymentController(SalePaymentRepository salePaymentRepository) {
        this.salePaymentRepository = salePaymentRepository;
    }

    @GetMapping
    public List<SalePaymentResponse> list(@RequestParam(defaultValue = "50") int limit,
                                           @RequestParam(defaultValue = "0") int offset,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        List<SalePayment> payments = salePaymentRepository
                .findByUserIdOrderByPaymentDateDesc(userId, PageRequest.of(offset / limit, limit));
        return payments.stream().map(SalePaymentResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SalePaymentResponse create(@Valid @RequestBody SalePaymentCreate body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        SalePayment s = SalePayment.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .buyerId(body.getBuyerId())
                .paymentDate(body.getPaymentDate())
                .invoiceNo(body.getInvoiceNo())
                .total(body.getTotal())
                .received(body.getReceived())
                .balance(body.getBalance())
                .bankName(body.getBankName())
                .chequeNo(body.getChequeNo())
                .paymentMode(body.getPaymentMode())
                .narration(body.getNarration())
                .build();
        return SalePaymentResponse.from(salePaymentRepository.save(s));
    }

    @GetMapping("/{id}")
    public SalePaymentResponse get(@PathVariable UUID id,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return SalePaymentResponse.from(salePaymentRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sale payment not found")));
    }

    @PatchMapping("/{id}")
    public SalePaymentResponse update(@PathVariable UUID id,
                                       @RequestBody SalePaymentUpdate body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        SalePayment s = salePaymentRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sale payment not found"));
        if (body.getCompanyId() != null) s.setCompanyId(body.getCompanyId());
        if (body.getBuyerId() != null) s.setBuyerId(body.getBuyerId());
        if (body.getPaymentDate() != null) s.setPaymentDate(body.getPaymentDate());
        if (body.getInvoiceNo() != null) s.setInvoiceNo(body.getInvoiceNo());
        if (body.getTotal() != null) s.setTotal(body.getTotal());
        if (body.getReceived() != null) s.setReceived(body.getReceived());
        if (body.getBalance() != null) s.setBalance(body.getBalance());
        if (body.getBankName() != null) s.setBankName(body.getBankName());
        if (body.getChequeNo() != null) s.setChequeNo(body.getChequeNo());
        if (body.getPaymentMode() != null) s.setPaymentMode(body.getPaymentMode());
        if (body.getNarration() != null) s.setNarration(body.getNarration());
        return SalePaymentResponse.from(salePaymentRepository.save(s));
    }

    @GetMapping("/ledger/{buyerId}")
    public List<SalePaymentResponse> ledger(@PathVariable UUID buyerId,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return salePaymentRepository.findByUserIdAndBuyerId(userId, buyerId)
                .stream().map(SalePaymentResponse::from).toList();
    }
}
