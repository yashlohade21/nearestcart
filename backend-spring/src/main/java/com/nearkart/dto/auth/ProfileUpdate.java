package com.nearkart.dto.auth;

import lombok.Data;

@Data
public class ProfileUpdate {
    private String name;
    private String businessName;
    private String city;
    private String state;
    private String mandiName;
    private String language;
    private String gstNumber;
    private String address;
    private String upiId;
}
