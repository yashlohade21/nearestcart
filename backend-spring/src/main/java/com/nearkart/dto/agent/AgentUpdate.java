package com.nearkart.dto.agent;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AgentUpdate {
    private String name; private String phone; private String email;
    private String panNumber; private BigDecimal commissionRate;
    private String city; private String state; private String address;
    private String notes; private Boolean isActive;
}
