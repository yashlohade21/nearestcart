package com.nearkart.controller;

import com.nearkart.dto.deal.*;
import com.nearkart.entity.Deal;
import com.nearkart.repository.DealRepository;
import com.nearkart.security.UserPrincipal;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/deals")
@Transactional
public class DealController {

    private final DealRepository dealRepository;
    private final EntityManager entityManager;

    public DealController(DealRepository dealRepository, EntityManager entityManager) {
        this.dealRepository = dealRepository;
        this.entityManager = entityManager;
    }

    @GetMapping
    public List<DealResponse> listDeals(
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(required = false) UUID farmerId,
            @RequestParam(required = false) UUID buyerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID userId = principal.getEffectiveUserId();
        var cb = entityManager.getCriteriaBuilder();
        var cq = cb.createQuery(Deal.class);
        var root = cq.from(Deal.class);
        root.fetch("farmer", jakarta.persistence.criteria.JoinType.LEFT);
        root.fetch("buyer", jakarta.persistence.criteria.JoinType.LEFT);
        root.fetch("product", jakarta.persistence.criteria.JoinType.LEFT);
        root.fetch("transporter", jakarta.persistence.criteria.JoinType.LEFT);

        var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
        predicates.add(cb.equal(root.get("userId"), userId));
        if (dateFrom != null) predicates.add(cb.greaterThanOrEqualTo(root.get("dealDate"), dateFrom));
        if (dateTo != null) predicates.add(cb.lessThanOrEqualTo(root.get("dealDate"), dateTo));
        if (farmerId != null) predicates.add(cb.equal(root.get("farmerId"), farmerId));
        if (buyerId != null) predicates.add(cb.equal(root.get("buyerId"), buyerId));
        if (status != null) predicates.add(cb.equal(root.get("status"), status));

        cq.where(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        cq.orderBy(cb.desc(root.get("dealDate")), cb.desc(root.get("createdAt")));

        var query = entityManager.createQuery(cq);
        query.setFirstResult(offset);
        query.setMaxResults(limit);

        return query.getResultList().stream().map(DealResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public DealResponse createDeal(@Valid @RequestBody DealCreate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        Deal deal = Deal.builder()
                .userId(principal.getEffectiveUserId())
                .farmerId(body.getFarmerId())
                .buyerId(body.getBuyerId())
                .productId(body.getProductId())
                .quantity(body.getQuantity())
                .unit(body.getUnit() != null ? body.getUnit() : "kg")
                .buyRate(body.getBuyRate())
                .sellRate(body.getSellRate())
                .transportCost(body.getTransportCost())
                .labourCost(body.getLabourCost())
                .otherCost(body.getOtherCost())
                .transporterId(body.getTransporterId())
                .dealDate(body.getDealDate() != null ? body.getDealDate() : LocalDate.now())
                .deliveryDate(body.getDeliveryDate())
                .paymentDueDate(body.getPaymentDueDate())
                .qualityGrade(body.getQualityGrade())
                .notes(body.getNotes())
                .build();
        deal = dealRepository.save(deal);
        // Reload with relations
        entityManager.flush();
        entityManager.clear();
        Deal loaded = dealRepository.findByIdAndUserId(deal.getId(), principal.getEffectiveUserId())
                .orElseThrow();
        entityManager.refresh(loaded);
        return DealResponse.from(loaded);
    }

    @GetMapping("/{dealId}")
    public DealResponse getDeal(@PathVariable UUID dealId,
                                @AuthenticationPrincipal UserPrincipal principal) {
        Deal deal = dealRepository.findByIdAndUserId(dealId, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));
        return DealResponse.from(deal);
    }

    @PatchMapping("/{dealId}")
    @Transactional
    public DealResponse updateDeal(@PathVariable UUID dealId, @RequestBody DealUpdate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        Deal deal = dealRepository.findByIdAndUserId(dealId, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));

        if (body.getFarmerId() != null) deal.setFarmerId(body.getFarmerId());
        if (body.getBuyerId() != null) deal.setBuyerId(body.getBuyerId());
        if (body.getProductId() != null) deal.setProductId(body.getProductId());
        if (body.getQuantity() != null) deal.setQuantity(body.getQuantity());
        if (body.getUnit() != null) deal.setUnit(body.getUnit());
        if (body.getBuyRate() != null) deal.setBuyRate(body.getBuyRate());
        if (body.getSellRate() != null) deal.setSellRate(body.getSellRate());
        if (body.getTransportCost() != null) deal.setTransportCost(body.getTransportCost());
        if (body.getLabourCost() != null) deal.setLabourCost(body.getLabourCost());
        if (body.getOtherCost() != null) deal.setOtherCost(body.getOtherCost());
        if (body.getStatus() != null) deal.setStatus(body.getStatus());
        if (body.getFarmerPaymentStatus() != null) deal.setFarmerPaymentStatus(body.getFarmerPaymentStatus());
        if (body.getBuyerPaymentStatus() != null) deal.setBuyerPaymentStatus(body.getBuyerPaymentStatus());
        if (body.getFarmerPaidAmount() != null) deal.setFarmerPaidAmount(body.getFarmerPaidAmount());
        if (body.getBuyerReceivedAmount() != null) deal.setBuyerReceivedAmount(body.getBuyerReceivedAmount());
        if (body.getSpoilageQty() != null) deal.setSpoilageQty(body.getSpoilageQty());
        if (body.getSpoilageReason() != null) deal.setSpoilageReason(body.getSpoilageReason());
        if (body.getTransporterId() != null) deal.setTransporterId(body.getTransporterId());
        if (body.getDealDate() != null) deal.setDealDate(body.getDealDate());
        if (body.getDeliveryDate() != null) deal.setDeliveryDate(body.getDeliveryDate());
        if (body.getPaymentDueDate() != null) deal.setPaymentDueDate(body.getPaymentDueDate());
        if (body.getQualityGrade() != null) deal.setQualityGrade(body.getQualityGrade());
        if (body.getHasDispute() != null) deal.setHasDispute(body.getHasDispute());
        if (body.getDisputeNotes() != null) deal.setDisputeNotes(body.getDisputeNotes());
        if (body.getNotes() != null) deal.setNotes(body.getNotes());

        deal = dealRepository.save(deal);
        return DealResponse.from(deal);
    }

    @DeleteMapping("/{dealId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDeal(@PathVariable UUID dealId,
                           @AuthenticationPrincipal UserPrincipal principal) {
        Deal deal = dealRepository.findByIdAndUserId(dealId, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));
        deal.setStatus("cancelled");
        dealRepository.save(deal);
    }
}
