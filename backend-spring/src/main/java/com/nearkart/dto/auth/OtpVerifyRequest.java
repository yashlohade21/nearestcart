package com.nearkart.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    @NotBlank
    private String phone;
    @NotBlank
    private String otp;
    private String name;
}
