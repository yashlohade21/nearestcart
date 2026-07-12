package com.nearkart.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class TeamMemberResponse {
    private String id;
    private String phone;
    private String name;
    private String role;
    private String createdAt;
}
