package com.nearkart.dto.agent;

import com.nearkart.entity.Agent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class AgentResponse {
    private UUID id; private UUID userId; private String name; private String phone;
    private BigDecimal commissionRate; private String email; private String panNumber;
    private String city; private String state; private String address;
    private String notes; private Boolean isActive;
    private OffsetDateTime createdAt; private OffsetDateTime updatedAt;

    public static AgentResponse from(Agent a) {
        return AgentResponse.builder()
                .id(a.getId()).userId(a.getUserId()).name(a.getName()).phone(a.getPhone())
                .commissionRate(a.getCommissionRate()).email(a.getEmail()).panNumber(a.getPanNumber())
                .city(a.getCity()).state(a.getState()).address(a.getAddress())
                .notes(a.getNotes()).isActive(a.getIsActive()).createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt())
                .build();
    }
}
