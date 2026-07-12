package com.nearkart.controller;

import com.nearkart.dto.agent.*;
import com.nearkart.entity.Agent;
import com.nearkart.repository.AgentRepository;
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
@RequestMapping("/api/agents")
@Transactional
public class AgentController {

    private final AgentRepository agentRepository;

    public AgentController(AgentRepository agentRepository) {
        this.agentRepository = agentRepository;
    }

    @GetMapping
    public List<AgentResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return agentRepository.findByUserIdOrderByNameAsc(userId)
                .stream().map(AgentResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgentResponse create(@Valid @RequestBody AgentCreate body,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        Agent a = Agent.builder()
                .userId(principal.getEffectiveUserId())
                .name(body.getName())
                .phone(body.getPhone())
                .email(body.getEmail())
                .panNumber(body.getPanNumber())
                .commissionRate(body.getCommissionRate())
                .city(body.getCity())
                .state(body.getState())
                .address(body.getAddress())
                .notes(body.getNotes())
                .build();
        return AgentResponse.from(agentRepository.save(a));
    }

    @GetMapping("/{id}")
    public AgentResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return AgentResponse.from(agentRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found")));
    }

    @PatchMapping("/{id}")
    public AgentResponse update(@PathVariable UUID id, @RequestBody AgentUpdate body,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        Agent a = agentRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        if (body.getName() != null) a.setName(body.getName());
        if (body.getPhone() != null) a.setPhone(body.getPhone());
        if (body.getEmail() != null) a.setEmail(body.getEmail());
        if (body.getPanNumber() != null) a.setPanNumber(body.getPanNumber());
        if (body.getCommissionRate() != null) a.setCommissionRate(body.getCommissionRate());
        if (body.getCity() != null) a.setCity(body.getCity());
        if (body.getState() != null) a.setState(body.getState());
        if (body.getAddress() != null) a.setAddress(body.getAddress());
        if (body.getNotes() != null) a.setNotes(body.getNotes());
        if (body.getIsActive() != null) a.setIsActive(body.getIsActive());
        return AgentResponse.from(agentRepository.save(a));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Agent a = agentRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        a.setIsActive(false);
        agentRepository.save(a);
    }
}
