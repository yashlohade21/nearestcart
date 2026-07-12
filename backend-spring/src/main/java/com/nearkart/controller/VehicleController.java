package com.nearkart.controller;

import com.nearkart.dto.vehicle.VehicleCreate;
import com.nearkart.dto.vehicle.VehicleUpdate;
import com.nearkart.dto.vehicle.VehicleResponse;
import com.nearkart.entity.Vehicle;
import com.nearkart.repository.VehicleRepository;
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
@RequestMapping("/api/vehicles")
@Transactional
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public List<VehicleResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return vehicleRepository.findByUserIdOrderByVehicleNoAsc(userId)
                .stream().map(VehicleResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleResponse create(@Valid @RequestBody VehicleCreate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        Vehicle v = Vehicle.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .vehicleNo(body.getVehicleNo())
                .ownerName(body.getOwnerName())
                .driverName(body.getDriverName())
                .phone(body.getPhone())
                .vehicleType(body.getVehicleType())
                .build();
        return VehicleResponse.from(vehicleRepository.save(v));
    }

    @GetMapping("/{id}")
    public VehicleResponse get(@PathVariable UUID id,
                                @AuthenticationPrincipal UserPrincipal principal) {
        return VehicleResponse.from(vehicleRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found")));
    }

    @PatchMapping("/{id}")
    public VehicleResponse update(@PathVariable UUID id, @RequestBody VehicleUpdate body,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        Vehicle v = vehicleRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        if (body.getCompanyId() != null) v.setCompanyId(body.getCompanyId());
        if (body.getVehicleNo() != null) v.setVehicleNo(body.getVehicleNo());
        if (body.getOwnerName() != null) v.setOwnerName(body.getOwnerName());
        if (body.getDriverName() != null) v.setDriverName(body.getDriverName());
        if (body.getPhone() != null) v.setPhone(body.getPhone());
        if (body.getVehicleType() != null) v.setVehicleType(body.getVehicleType());
        if (body.getIsActive() != null) v.setIsActive(body.getIsActive());
        return VehicleResponse.from(vehicleRepository.save(v));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Vehicle v = vehicleRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        v.setIsActive(false);
        vehicleRepository.save(v);
    }
}
