package com.nearkart.controller;

import com.nearkart.dto.agent.AgentCommissionCreate;
import com.nearkart.dto.agent.AgentCommissionResponse;
import com.nearkart.entity.AgentCommission;
import com.nearkart.repository.AgentCommissionRepository;
import com.nearkart.security.UserPrincipal;
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
@RequestMapping("/api/agent-commissions")
@Transactional
public class AgentCommissionController {

    private final AgentCommissionRepository agentCommissionRepository;

    public AgentCommissionController(AgentCommissionRepository agentCommissionRepository) {
        this.agentCommissionRepository = agentCommissionRepository;
    }

    @GetMapping
    public List<AgentCommissionResponse> list(@RequestParam(defaultValue = "50") int limit,
                                               @RequestParam(defaultValue = "0") int offset,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return agentCommissionRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(offset / limit, limit))
                .stream().map(AgentCommissionResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgentCommissionResponse create(@Valid @RequestBody AgentCommissionCreate body,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        AgentCommission c = AgentCommission.builder()
                .userId(principal.getEffectiveUserId())
                .companyId(body.getCompanyId())
                .agentId(body.getAgentId())
                .billNo(body.getBillNo())
                .supplierName(body.getSupplierName())
                .vehicleNo(body.getVehicleNo())
                .billTotal(body.getBillTotal())
                .commissionPct(body.getCommissionPct())
                .commissionAmount(body.getCommissionAmount())
                .paymentDate(body.getPaymentDate())
                .paid(body.getPaid() != null ? body.getPaid() : false)
                .build();
        return AgentCommissionResponse.from(agentCommissionRepository.save(c));
    }

    @GetMapping("/{id}")
    public AgentCommissionResponse get(@PathVariable UUID id,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        return AgentCommissionResponse.from(agentCommissionRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent commission not found")));
    }

    @GetMapping("/agent/{agentId}")
    public List<AgentCommissionResponse> listByAgent(@PathVariable UUID agentId,
                                                      @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getEffectiveUserId();
        return agentCommissionRepository.findByUserIdAndAgentId(userId, agentId)
                .stream().map(AgentCommissionResponse::from).toList();
    }

    @PatchMapping("/{id}/pay")
    public AgentCommissionResponse markPaid(@PathVariable UUID id,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        AgentCommission c = agentCommissionRepository.findByIdAndUserId(id, principal.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent commission not found"));
        c.setPaid(true);
        c.setPaymentDate(LocalDate.now());
        return AgentCommissionResponse.from(agentCommissionRepository.save(c));
    }
}
