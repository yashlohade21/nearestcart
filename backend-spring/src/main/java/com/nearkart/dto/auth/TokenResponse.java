package com.nearkart.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "bearer";
    private String userId;
    private boolean isNewUser;
}
