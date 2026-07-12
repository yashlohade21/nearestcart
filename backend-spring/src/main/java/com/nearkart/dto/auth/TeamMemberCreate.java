package com.nearkart.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeamMemberCreate {
    @NotBlank
    private String phone;
    @NotBlank
    private String name;
    private String role = "manager";
}
