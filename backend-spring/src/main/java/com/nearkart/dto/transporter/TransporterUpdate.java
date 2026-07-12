package com.nearkart.dto.transporter;

import lombok.Data;

@Data
public class TransporterUpdate {
    private String name;
    private String phone;
    private String vehicleType;
    private String vehicleNumber;
    private String baseCity;
    private String notes;
    private Boolean isActive;
}
