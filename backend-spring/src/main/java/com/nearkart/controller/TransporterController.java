package com.nearkart.controller;

import com.nearkart.dto.transporter.*;
import com.nearkart.entity.Transporter;
import com.nearkart.repository.TransporterRepository;
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
@RequestMapping("/api/transporters")
@Transactional
public class TransporterController {

    private final TransporterRepository transporterRepository;

    public TransporterController(TransporterRepository transporterRepository) {
        this.transporterRepository = transporterRepository;
    }

    @GetMapping
    public List<TransporterResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return transporterRepository.findByUserIdOrderByNameAsc(userId)
                .stream().map(TransporterResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransporterResponse create(@Valid @RequestBody TransporterCreate body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        Transporter t = Transporter.builder()
                .userId(principal.getEffectiveUserId())
                .name(body.getName())
                .phone(body.getPhone())
                .vehicleType(body.getVehicleType())
                .vehicleNumber(body.getVehicleNumber())
                .baseCity(body.getBaseCity())
                .notes(body.getNotes())
                .build();
        return TransporterResponse.from(transporterRepository.save(t));
    }

    @PatchMapping("/{id}")
    public TransporterResponse update(@PathVariable UUID id, @RequestBody TransporterUpdate body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        Transporter t = transporterRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transporter not found"));
        if (body.getName() != null) t.setName(body.getName());
        if (body.getPhone() != null) t.setPhone(body.getPhone());
        if (body.getVehicleType() != null) t.setVehicleType(body.getVehicleType());
        if (body.getVehicleNumber() != null) t.setVehicleNumber(body.getVehicleNumber());
        if (body.getBaseCity() != null) t.setBaseCity(body.getBaseCity());
        if (body.getNotes() != null) t.setNotes(body.getNotes());
        if (body.getIsActive() != null) t.setIsActive(body.getIsActive());
        return TransporterResponse.from(transporterRepository.save(t));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Transporter t = transporterRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transporter not found"));
        t.setIsActive(false);
        transporterRepository.save(t);
    }
}
