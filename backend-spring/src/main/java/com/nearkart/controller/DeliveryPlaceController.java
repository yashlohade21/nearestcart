package com.nearkart.controller;

import com.nearkart.dto.delivery_place.DeliveryPlaceCreate;
import com.nearkart.dto.delivery_place.DeliveryPlaceUpdate;
import com.nearkart.dto.delivery_place.DeliveryPlaceResponse;
import com.nearkart.entity.DeliveryPlace;
import com.nearkart.repository.DeliveryPlaceRepository;
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
@RequestMapping("/api/delivery-places")
@Transactional
public class DeliveryPlaceController {

    private final DeliveryPlaceRepository deliveryPlaceRepository;

    public DeliveryPlaceController(DeliveryPlaceRepository deliveryPlaceRepository) {
        this.deliveryPlaceRepository = deliveryPlaceRepository;
    }

    @GetMapping
    public List<DeliveryPlaceResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return deliveryPlaceRepository.findByUserIdOrderByPlaceNameAsc(userId)
                .stream().map(DeliveryPlaceResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryPlaceResponse create(@Valid @RequestBody DeliveryPlaceCreate body,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        DeliveryPlace d = DeliveryPlace.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .placeName(body.getPlaceName())
                .district(body.getDistrict())
                .state(body.getState())
                .build();
        return DeliveryPlaceResponse.from(deliveryPlaceRepository.save(d));
    }

    @GetMapping("/{id}")
    public DeliveryPlaceResponse get(@PathVariable UUID id,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        return DeliveryPlaceResponse.from(deliveryPlaceRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery place not found")));
    }

    @PatchMapping("/{id}")
    public DeliveryPlaceResponse update(@PathVariable UUID id, @RequestBody DeliveryPlaceUpdate body,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        DeliveryPlace d = deliveryPlaceRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery place not found"));
        if (body.getCompanyId() != null) d.setCompanyId(body.getCompanyId());
        if (body.getPlaceName() != null) d.setPlaceName(body.getPlaceName());
        if (body.getDistrict() != null) d.setDistrict(body.getDistrict());
        if (body.getState() != null) d.setState(body.getState());
        return DeliveryPlaceResponse.from(deliveryPlaceRepository.save(d));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        DeliveryPlace d = deliveryPlaceRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery place not found"));
        deliveryPlaceRepository.delete(d);
    }
}
