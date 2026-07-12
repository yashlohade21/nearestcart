package com.nearkart.dto.farmer;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class FarmerUpdate {
    private String name;
    private String phone;
    private String email;
    private String village;
    private String district;
    private String state;
    private String address;
    private String panNumber;
    private BigDecimal openingBalance;
    private Integer creditDays;
    private List<String> primaryCrops;
    private String notes;
    private Boolean isActive;
}
