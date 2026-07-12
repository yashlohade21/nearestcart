package com.nearkart.dto.transporter;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TransporterCreate {
    @NotBlank private String name;
    private String phone;
    private String vehicleType;
    private String vehicleNumber;
    private String baseCity;
    private String notes;
}
