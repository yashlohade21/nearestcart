package com.nearkart.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ProfileResponse {
    private String id;
    private String phone;
    private String name;
    private String businessName;
    private String city;
    private String state;
    private String mandiName;
    private String language;
    private String gstNumber;
    private String address;
    private String logoUrl;
    private String upiId;
    private String role;
    private String plan;
}
