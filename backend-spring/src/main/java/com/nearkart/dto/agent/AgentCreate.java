package com.nearkart.dto.agent;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AgentCreate {
    @NotBlank private String name; private String phone; private String email;
    private String panNumber; private BigDecimal commissionRate;
    private String city; private String state; private String address;
    private String notes;
}
