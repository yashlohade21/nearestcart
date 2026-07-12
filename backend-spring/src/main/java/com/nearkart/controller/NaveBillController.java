package com.nearkart.controller;

import com.nearkart.dto.nave_bill.*;
import com.nearkart.entity.NaveBill;
import com.nearkart.entity.NaveBillDetail;
import com.nearkart.entity.NaveBillItem;
import com.nearkart.repository.NaveBillRepository;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nave-bills")
@Transactional
public class NaveBillController {

    private final NaveBillRepository naveBillRepository;

    public NaveBillController(NaveBillRepository naveBillRepository) {
        this.naveBillRepository = naveBillRepository;
    }

    @GetMapping
    public List<NaveBillResponse> list(@RequestParam(defaultValue = "50") int limit,
                                        @RequestParam(defaultValue = "0") int offset,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        List<NaveBill> bills = naveBillRepository
                .findByUserIdOrderByBillDateDesc(userId, PageRequest.of(offset / limit, limit));
        return bills.stream().map(NaveBillResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NaveBillResponse create(@Valid @RequestBody NaveBillCreate body,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        NaveBill bill = NaveBill.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .buyerId(body.getBuyerId())
                .billNo(body.getBillNo())
                .billDate(body.getBillDate())
                .totalAmount(body.getTotalAmount())
                .totalDeductions(body.getTotalDeductions())
                .netAmount(body.getNetAmount())
                .status(body.getStatus())
                .build();

        if (body.getItems() != null) {
            List<NaveBillItem> items = body.getItems().stream().map(i -> NaveBillItem.builder()
                    .productId(i.getProductId())
                    .kharidarName(i.getKharidarName())
                    .pautiNo(i.getPautiNo())
                    .weight(i.getWeight())
                    .rate(i.getRate())
                    .amount(i.getAmount())
                    .build()).collect(Collectors.toList());
            for (NaveBillItem item : items) {
                item.setNaveBill(bill);
            }
            bill.setItems(items);
        }

        if (body.getDetails() != null) {
            NaveBillDetailCreate d = body.getDetails();
            NaveBillDetail detail = NaveBillDetail.builder()
                    .marketFees(d.getMarketFees())
                    .supervision(d.getSupervision())
                    .adat(d.getAdat())
                    .bardan(d.getBardan())
                    .labour(d.getLabour())
                    .gadiBhada(d.getGadiBhada())
                    .sutli(d.getSutli())
                    .weightShort(d.getWeightShort())
                    .build();
            detail.setNaveBill(bill);
            bill.setDetails(detail);
        }

        return NaveBillResponse.from(naveBillRepository.save(bill));
    }

    @GetMapping("/{id}")
    public NaveBillResponse get(@PathVariable UUID id,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        return NaveBillResponse.from(naveBillRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nave bill not found")));
    }

    @PatchMapping("/{id}")
    public NaveBillResponse update(@PathVariable UUID id,
                                    @RequestBody NaveBillUpdate body,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        NaveBill bill = naveBillRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nave bill not found"));
        if (body.getCompanyId() != null) bill.setCompanyId(body.getCompanyId());
        if (body.getBillNo() != null) bill.setBillNo(body.getBillNo());
        if (body.getBillDate() != null) bill.setBillDate(body.getBillDate());
        if (body.getBuyerId() != null) bill.setBuyerId(body.getBuyerId());
        if (body.getTotalAmount() != null) bill.setTotalAmount(body.getTotalAmount());
        if (body.getTotalDeductions() != null) bill.setTotalDeductions(body.getTotalDeductions());
        if (body.getNetAmount() != null) bill.setNetAmount(body.getNetAmount());
        if (body.getStatus() != null) bill.setStatus(body.getStatus());
        return NaveBillResponse.from(naveBillRepository.save(bill));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        NaveBill bill = naveBillRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nave bill not found"));
        naveBillRepository.delete(bill);
    }

    @GetMapping("/{id}/print")
    public NaveBillResponse print(@PathVariable UUID id,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        return NaveBillResponse.from(naveBillRepository
                .findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nave bill not found")));
    }
}
