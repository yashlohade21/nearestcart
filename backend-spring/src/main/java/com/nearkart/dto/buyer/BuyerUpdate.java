package com.nearkart.dto.buyer;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BuyerUpdate {
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String companyType;
    private String city;
    private String state;
    private String address;
    private String gstNumber;
    private String panNumber;
    private BigDecimal openingBalance;
    private BigDecimal creditLimit;
    private Integer creditDays;
    private String notes;
    private Boolean isActive;
}
