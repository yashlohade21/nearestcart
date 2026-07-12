package com.nearkart.controller;

import com.nearkart.dto.payment.*;
import com.nearkart.entity.Advance;
import com.nearkart.entity.Deal;
import com.nearkart.entity.Payment;
import com.nearkart.repository.*;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@Transactional
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final DealRepository dealRepository;
    private final AdvanceRepository advanceRepository;

    public PaymentController(PaymentRepository paymentRepository, DealRepository dealRepository,
                             AdvanceRepository advanceRepository) {
        this.paymentRepository = paymentRepository;
        this.dealRepository = dealRepository;
        this.advanceRepository = advanceRepository;
    }

    @GetMapping
    public List<PaymentResponse> list(@RequestParam(required = false) String direction,
                                      @RequestParam(defaultValue = "50") int limit,
                                      @RequestParam(defaultValue = "0") int offset,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        if (direction != null) {
            return paymentRepository.findByUserIdAndDirectionOrderByPaymentDateDesc(userId, direction, PageRequest.of(offset / Math.max(limit,1), limit))
                    .stream().map(PaymentResponse::from).toList();
        }
        return paymentRepository.findByUserIdOrderByPaymentDateDesc(userId, PageRequest.of(offset / Math.max(limit,1), limit))
                .stream().map(PaymentResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@Valid @RequestBody PaymentCreate body,
                                  @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        Payment payment = Payment.builder()
                .userId(userId).dealId(body.getDealId()).advanceId(body.getAdvanceId())
                .direction(body.getDirection()).farmerId(body.getFarmerId()).buyerId(body.getBuyerId())
                .amount(body.getAmount()).paymentMode(body.getPaymentMode()).referenceNo(body.getReferenceNo())
                .paymentDate(body.getPaymentDate() != null ? body.getPaymentDate() : LocalDate.now())
                .notes(body.getNotes()).build();
        payment = paymentRepository.save(payment);

        // Update deal payment status if linked
        if (body.getDealId() != null) {
            dealRepository.findByIdAndUserId(body.getDealId(), userId).ifPresent(deal -> {
                if ("outgoing".equals(body.getDirection())) {
                    BigDecimal paid = deal.getFarmerPaidAmount().add(body.getAmount());
                    deal.setFarmerPaidAmount(paid);
                    BigDecimal buyTotal = deal.getQuantity().multiply(deal.getBuyRate());
                    deal.setFarmerPaymentStatus(paid.compareTo(buyTotal) >= 0 ? "paid" : "partial");
                } else {
                    BigDecimal received = deal.getBuyerReceivedAmount().add(body.getAmount());
                    deal.setBuyerReceivedAmount(received);
                    BigDecimal sellTotal = deal.getQuantity().multiply(deal.getSellRate());
                    deal.setBuyerPaymentStatus(received.compareTo(sellTotal) >= 0 ? "paid" : "partial");
                }
                dealRepository.save(deal);
            });
        }

        // Update advance if linked
        if (body.getAdvanceId() != null) {
            advanceRepository.findByIdAndUserId(body.getAdvanceId(), userId).ifPresent(adv -> {
                BigDecimal newRecovered = adv.getRecovered().add(body.getAmount());
                adv.setRecovered(newRecovered);
                if (newRecovered.compareTo(adv.getAmount()) >= 0) {
                    adv.setStatus("recovered");
                } else {
                    adv.setStatus("partial");
                }
                advanceRepository.save(adv);
            });
        }

        return PaymentResponse.from(payment);
    }

    @GetMapping("/pending")
    public PendingPayments pending(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        BigDecimal fromBuyers = dealRepository.sumPendingFromBuyers(userId);
        BigDecimal toFarmers = dealRepository.sumPendingToFarmers(userId);
        return PendingPayments.builder()
                .fromBuyers(List.of())
                .toFarmers(List.of())
                .totalFromBuyers(fromBuyers)
                .totalToFarmers(toFarmers)
                .netPosition(fromBuyers.subtract(toFarmers))
                .build();
    }
}
